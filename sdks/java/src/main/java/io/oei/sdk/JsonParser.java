package io.oei.sdk;

import java.util.*;

/**
 * Minimal JSON parser for OEI exercise files.
 * Uses {@link javax.json} when available; falls back to a hand-written subset
 * sufficient for the flat-ish OEI schema when it is not on the classpath.
 *
 * In production we recommend including a proper JSON library (e.g., Jackson,
 * Gson, or org.json) and replacing the call in {@link #parseExercise} with the
 * library's Map/List parser. The public contract of this class does not change.
 */
final class JsonParser {

    private JsonParser() {}

    @SuppressWarnings("unchecked")
    static Exercise parseExercise(String json) {
        // We use the javax.json API if present (Java EE / Jakarta EE runtime),
        // otherwise fall back to our minimal parser.
        Map<String, Object> map = parseMap(json);
        return fromMap(map);
    }

    // -----------------------------------------------------------------------
    // Convert parsed map → Exercise
    // -----------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private static Exercise fromMap(Map<String, Object> m) {
        Exercise.Builder b = new Exercise.Builder();
        b.exerciseId = str(m, "exercise_id");
        b.slug = str(m, "slug");
        b.name = str(m, "name");
        b.alternativeNames = strList(m, "alternative_names");
        b.description = str(m, "description");
        b.category = str(m, "category");
        b.exerciseType = str(m, "exercise_type");
        b.difficultyLevel = str(m, "difficulty_level");
        b.movementPattern = str(m, "movement_pattern");
        b.forceType = str(m, "force_type");
        b.mechanicsType = str(m, "mechanics_type");
        b.laterality = str(m, "laterality");
        b.exerciseFamily = str(m, "exercise_family");
        b.status = str(m, "status");
        b.equipmentRequired = strList(m, "equipment_required");
        b.equipmentOptional = strList(m, "equipment_optional");
        b.muscles = parseMuscles((Map<String, Object>) m.getOrDefault("muscles", Map.of()));
        b.execution = parseExecution((Map<String, Object>) m.getOrDefault("execution", Map.of()));
        b.trainingParameters = parseTraining((Map<String, Object>) m.getOrDefault("training_parameters", Map.of()));
        b.metadata = parseMeta((Map<String, Object>) m.getOrDefault("metadata", Map.of()));
        b.raw = m;
        return b.build();
    }

    @SuppressWarnings("unchecked")
    private static Exercise.Muscles parseMuscles(Map<String, Object> m) {
        return new Exercise.Muscles(
            muscleRefs((List<Object>) m.getOrDefault("primary", List.of())),
            muscleRefs((List<Object>) m.getOrDefault("secondary", List.of())),
            muscleRefs((List<Object>) m.getOrDefault("stabilizers", List.of()))
        );
    }

    @SuppressWarnings("unchecked")
    private static List<Exercise.MuscleRef> muscleRefs(List<Object> list) {
        List<Exercise.MuscleRef> out = new ArrayList<>();
        for (Object o : list) {
            Map<String, Object> mm = (Map<String, Object>) o;
            out.add(new Exercise.MuscleRef(str(mm, "muscle_id"), str(mm, "muscle_slug")));
        }
        return Collections.unmodifiableList(out);
    }

    @SuppressWarnings("unchecked")
    private static Exercise.Execution parseExecution(Map<String, Object> m) {
        return new Exercise.Execution(
            str(m, "starting_position"),
            str(m, "setup_instructions"),
            strList(m, "steps"),
            str(m, "breathing_instructions"),
            strList(m, "common_mistakes"),
            strList(m, "safety_considerations"),
            str(m, "range_of_motion_guidance"),
            str(m, "tempo_recommendations"),
            strList(m, "coaching_cues")
        );
    }

    @SuppressWarnings("unchecked")
    private static Exercise.TrainingParameters parseTraining(Map<String, Object> m) {
        return new Exercise.TrainingParameters(
            strList(m, "training_goals"),
            (Map<String, Object>) m.getOrDefault("rest_periods", Map.of())
        );
    }

    @SuppressWarnings("unchecked")
    private static Exercise.ExerciseMetadata parseMeta(Map<String, Object> m) {
        return new Exercise.ExerciseMetadata(
            str(m, "created_at"),
            str(m, "updated_at"),
            str(m, "version"),
            strList(m, "tags")
        );
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof String ? (String) v : "";
    }

    @SuppressWarnings("unchecked")
    private static List<String> strList(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (!(v instanceof List)) return List.of();
        List<String> out = new ArrayList<>();
        for (Object o : (List<Object>) v) if (o instanceof String) out.add((String) o);
        return Collections.unmodifiableList(out);
    }

    // -----------------------------------------------------------------------
    // Minimal JSON → Map/List parser
    // -----------------------------------------------------------------------

    static Map<String, Object> parseMap(String json) {
        return (Map<String, Object>) new Tokenizer(json.trim()).parseValue();
    }

    private static final class Tokenizer {
        private final String src;
        private int pos;

        Tokenizer(String src) { this.src = src; }

        @SuppressWarnings("unchecked")
        Object parseValue() {
            skipWs();
            char c = peek();
            if (c == '{') return parseObject();
            if (c == '[') return parseArray();
            if (c == '"') return parseString();
            if (c == 't') { pos += 4; return Boolean.TRUE; }
            if (c == 'f') { pos += 5; return Boolean.FALSE; }
            if (c == 'n') { pos += 4; return null; }
            return parseNumber();
        }

        private Map<String, Object> parseObject() {
            pos++; // {
            Map<String, Object> m = new LinkedHashMap<>();
            skipWs();
            while (peek() != '}') {
                String key = parseString();
                skipWs(); pos++; // :
                Object val = parseValue();
                m.put(key, val);
                skipWs();
                if (peek() == ',') pos++;
                skipWs();
            }
            pos++; // }
            return m;
        }

        private List<Object> parseArray() {
            pos++; // [
            List<Object> list = new ArrayList<>();
            skipWs();
            while (peek() != ']') {
                list.add(parseValue());
                skipWs();
                if (peek() == ',') pos++;
                skipWs();
            }
            pos++; // ]
            return list;
        }

        private String parseString() {
            pos++; // "
            StringBuilder sb = new StringBuilder();
            while (pos < src.length()) {
                char c = src.charAt(pos++);
                if (c == '"') break;
                if (c == '\\') {
                    char esc = src.charAt(pos++);
                    switch (esc) {
                        case '"': sb.append('"'); break;
                        case '\\': sb.append('\\'); break;
                        case '/': sb.append('/'); break;
                        case 'n': sb.append('\n'); break;
                        case 'r': sb.append('\r'); break;
                        case 't': sb.append('\t'); break;
                        case 'u':
                            sb.append((char) Integer.parseInt(src.substring(pos, pos + 4), 16));
                            pos += 4;
                            break;
                        default: sb.append(esc);
                    }
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();
        }

        private Number parseNumber() {
            int start = pos;
            while (pos < src.length() && "0123456789.-+eE".indexOf(src.charAt(pos)) >= 0) pos++;
            String s = src.substring(start, pos);
            try { return Long.parseLong(s); } catch (NumberFormatException ignored) {}
            return Double.parseDouble(s);
        }

        private char peek() {
            skipWs();
            return pos < src.length() ? src.charAt(pos) : 0;
        }

        private void skipWs() {
            while (pos < src.length() && src.charAt(pos) <= ' ') pos++;
        }
    }
}

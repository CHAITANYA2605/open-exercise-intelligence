package io.oei.api.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.oei.api.model.Equipment;
import io.oei.api.model.Exercise;
import io.oei.api.model.Muscle;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DatasetService {

    private static final Logger log = LoggerFactory.getLogger(DatasetService.class);

    @Value("${oei.dataset.path:data/oei-dataset.json}")
    private String datasetPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<Exercise> exercises = Collections.emptyList();
    private List<Muscle> muscles = Collections.emptyList();
    private List<Equipment> equipment = Collections.emptyList();
    private DatasetMeta datasetMeta;
    private Map<String, Equipment> equipmentById = Collections.emptyMap();

    @PostConstruct
    public void load() {
        loadExercises();
        loadMuscles();
        loadEquipment();
    }

    private void loadExercises() {
        try {
            DatasetWrapper wrapper = null;
            File file = new File(datasetPath);
            if (file.exists()) {
                log.info("Loading dataset from file: {}", file.getAbsolutePath());
                wrapper = objectMapper.readValue(file, DatasetWrapper.class);
            } else {
                log.info("Loading dataset from classpath: {}", datasetPath);
                try (InputStream is = getClass().getClassLoader().getResourceAsStream(datasetPath)) {
                    if (is != null) {
                        wrapper = objectMapper.readValue(is, DatasetWrapper.class);
                    }
                }
            }
            if (wrapper != null) {
                exercises = wrapper.getExercises() != null ? wrapper.getExercises() : Collections.emptyList();
                datasetMeta = new DatasetMeta(wrapper.getVersion(), wrapper.getGeneratedAt(), exercises.size());
                log.info("Loaded {} exercises", exercises.size());
            } else {
                log.error("Could not find dataset at {} or on classpath", datasetPath);
            }
        } catch (Exception e) {
            log.error("Failed to load exercise dataset", e);
        }
    }

    private void loadMuscles() {
        String path = "data/muscles/muscles.json";
        try {
            File file = new File(path);
            if (file.exists()) {
                muscles = objectMapper.readValue(file,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Muscle.class));
            } else {
                try (InputStream is = getClass().getClassLoader().getResourceAsStream(path)) {
                    if (is != null) {
                        muscles = objectMapper.readValue(is,
                                objectMapper.getTypeFactory().constructCollectionType(List.class, Muscle.class));
                    }
                }
            }
            log.info("Loaded {} muscles", muscles.size());
        } catch (Exception e) {
            log.error("Failed to load muscles", e);
        }
    }

    private void loadEquipment() {
        String path = "data/equipment/equipment.json";
        try {
            File file = new File(path);
            if (file.exists()) {
                equipment = objectMapper.readValue(file,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Equipment.class));
            } else {
                try (InputStream is = getClass().getClassLoader().getResourceAsStream(path)) {
                    if (is != null) {
                        equipment = objectMapper.readValue(is,
                                objectMapper.getTypeFactory().constructCollectionType(List.class, Equipment.class));
                    }
                }
            }
            equipmentById = equipment.stream()
                    .collect(Collectors.toMap(Equipment::getEquipmentId, Function.identity(), (a, b) -> a));
            log.info("Loaded {} equipment items", equipment.size());
        } catch (Exception e) {
            log.error("Failed to load equipment", e);
        }
    }

    public List<Exercise> getExercises() { return exercises; }
    public List<Muscle> getMuscles() { return muscles; }
    public List<Equipment> getEquipment() { return equipment; }
    public DatasetMeta getDatasetMeta() { return datasetMeta; }
    public Map<String, Equipment> getEquipmentById() { return equipmentById; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DatasetWrapper {
        private String version;

        @JsonProperty("generated_at")
        private String generatedAt;

        @JsonProperty("exercise_count")
        private int exerciseCount;

        private List<Exercise> exercises;

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public String getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }

        public int getExerciseCount() { return exerciseCount; }
        public void setExerciseCount(int exerciseCount) { this.exerciseCount = exerciseCount; }

        public List<Exercise> getExercises() { return exercises; }
        public void setExercises(List<Exercise> exercises) { this.exercises = exercises; }
    }

    public static class DatasetMeta {
        private String version;
        private String generatedAt;
        private int exerciseCount;

        public DatasetMeta(String version, String generatedAt, int exerciseCount) {
            this.version = version;
            this.generatedAt = generatedAt;
            this.exerciseCount = exerciseCount;
        }

        public String getVersion() { return version; }
        public String getGeneratedAt() { return generatedAt; }
        public int getExerciseCount() { return exerciseCount; }
    }
}

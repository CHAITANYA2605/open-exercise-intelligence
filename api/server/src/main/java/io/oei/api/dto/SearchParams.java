package io.oei.api.dto;

public class SearchParams {

    private String q;
    private String category;
    private String difficulty;
    private String muscle;
    private String equipment;
    private String movementPattern;
    private String exerciseType;
    private int page = 1;
    private int perPage = 20;

    public String getQ() { return q; }
    public void setQ(String q) { this.q = q; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getMuscle() { return muscle; }
    public void setMuscle(String muscle) { this.muscle = muscle; }

    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }

    public String getMovementPattern() { return movementPattern; }
    public void setMovementPattern(String movementPattern) { this.movementPattern = movementPattern; }

    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = Math.max(1, page); }

    public int getPerPage() { return perPage; }
    public void setPerPage(int perPage) { this.perPage = Math.min(100, Math.max(1, perPage)); }
}

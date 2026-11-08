package io.oei.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Muscle {

    @JsonProperty("muscle_id")
    private String muscleId;

    private String slug;

    @JsonProperty("entry_type")
    private String entryType;

    @JsonProperty("anatomical_name")
    private String anatomicalName;

    @JsonProperty("common_name")
    private String commonName;

    @JsonProperty("parent_group_id")
    private String parentGroupId;

    @JsonProperty("anatomical_region")
    private String anatomicalRegion;

    @JsonProperty("body_surface")
    private String bodySurface;

    private String laterality;
    private String description;

    @JsonProperty("related_muscle_ids")
    private List<String> relatedMuscleIds;

    public String getMuscleId() { return muscleId; }
    public void setMuscleId(String muscleId) { this.muscleId = muscleId; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getEntryType() { return entryType; }
    public void setEntryType(String entryType) { this.entryType = entryType; }

    public String getAnatomicalName() { return anatomicalName; }
    public void setAnatomicalName(String anatomicalName) { this.anatomicalName = anatomicalName; }

    public String getCommonName() { return commonName; }
    public void setCommonName(String commonName) { this.commonName = commonName; }

    public String getParentGroupId() { return parentGroupId; }
    public void setParentGroupId(String parentGroupId) { this.parentGroupId = parentGroupId; }

    public String getAnatomicalRegion() { return anatomicalRegion; }
    public void setAnatomicalRegion(String anatomicalRegion) { this.anatomicalRegion = anatomicalRegion; }

    public String getBodySurface() { return bodySurface; }
    public void setBodySurface(String bodySurface) { this.bodySurface = bodySurface; }

    public String getLaterality() { return laterality; }
    public void setLaterality(String laterality) { this.laterality = laterality; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getRelatedMuscleIds() { return relatedMuscleIds; }
    public void setRelatedMuscleIds(List<String> relatedMuscleIds) { this.relatedMuscleIds = relatedMuscleIds; }
}

package io.oei.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Equipment {

    @JsonProperty("equipment_id")
    private String equipmentId;

    private String slug;
    private String name;
    private String description;
    private String category;
    private String subcategory;

    @JsonProperty("space_required")
    private String spaceRequired;

    @JsonProperty("cost_tier")
    private String costTier;

    private String portability;

    @JsonProperty("common_alternatives")
    private List<String> commonAlternatives;

    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }

    public String getSpaceRequired() { return spaceRequired; }
    public void setSpaceRequired(String spaceRequired) { this.spaceRequired = spaceRequired; }

    public String getCostTier() { return costTier; }
    public void setCostTier(String costTier) { this.costTier = costTier; }

    public String getPortability() { return portability; }
    public void setPortability(String portability) { this.portability = portability; }

    public List<String> getCommonAlternatives() { return commonAlternatives; }
    public void setCommonAlternatives(List<String> commonAlternatives) { this.commonAlternatives = commonAlternatives; }
}

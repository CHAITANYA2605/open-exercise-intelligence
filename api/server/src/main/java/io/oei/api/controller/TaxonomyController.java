package io.oei.api.controller;

import io.oei.api.dto.FacetResponse;
import io.oei.api.model.Equipment;
import io.oei.api.model.Muscle;
import io.oei.api.service.DatasetService;
import io.oei.api.service.ExerciseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1")
public class TaxonomyController {

    private final DatasetService datasetService;
    private final ExerciseService exerciseService;

    public TaxonomyController(DatasetService datasetService, ExerciseService exerciseService) {
        this.datasetService = datasetService;
        this.exerciseService = exerciseService;
    }

    @GetMapping("/muscles")
    public List<Muscle> getMuscles() {
        return datasetService.getMuscles();
    }

    @GetMapping("/equipment")
    public List<Equipment> getEquipment() {
        return datasetService.getEquipment();
    }

    @GetMapping("/facets")
    public FacetResponse getFacets() {
        return exerciseService.getFacets();
    }
}

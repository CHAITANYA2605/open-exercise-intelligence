package io.oei.api.controller;

import io.oei.api.service.DatasetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1")
public class DatasetController {

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping("/dataset-version")
    public ResponseEntity<DatasetService.DatasetMeta> getDatasetVersion() {
        DatasetService.DatasetMeta meta = datasetService.getDatasetMeta();
        if (meta == null) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok(meta);
    }
}

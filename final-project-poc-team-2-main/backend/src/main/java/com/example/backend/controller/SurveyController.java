package com.example.backend.controller;

import java.net.URI;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Survey;
import com.example.backend.model.User;
import com.example.backend.repository.SurveyRepository;
import com.example.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;

    @Autowired
    public SurveyController(SurveyRepository surveyRepository,
                            UserRepository userRepository) {
        this.surveyRepository = surveyRepository;
        this.userRepository = userRepository;
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<Survey> getByUserId(@PathVariable Long userId) {
        Optional<Survey> surveyOpt = surveyRepository.findByUserId(userId);
        return surveyOpt
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/surveys
     * Create a new Survey. Body should include:
     * {
     *   "userId": 123,
     *   "answers": { ... }   // any JSON object matching your Survey.answers field
     * }
     */
    @PostMapping
public ResponseEntity<Survey> create(@RequestBody CreateSurveyRequest req) {
    // 1) Look up the User
    User user = userRepository.findById(req.getUserId())
        .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

    // 2) Check for existing survey
    Survey survey = surveyRepository.findByUserId(user.getId())
        .orElseGet(() -> {
            Survey newSurvey = new Survey();
            newSurvey.setUser(user);
            return newSurvey;
        });

    // 3) Update answers
    survey.setAnswers(req.getAnswers());

    // 4) Save (will update if exists or insert if new)
    Survey saved = surveyRepository.save(survey);

    // 5) Return 200 OK with the saved object
    return ResponseEntity.ok(saved);
}

   
    public static class CreateSurveyRequest {
        private Long userId;
        private JsonNode answers;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public JsonNode getAnswers() { return answers; }
        public void setAnswers(JsonNode answers) { this.answers = answers; }
    }
}

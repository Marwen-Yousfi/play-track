import { Injectable } from '@angular/core';
import { LiveEvent } from '../../../core/models/event.model';
import { Match } from '../../../core/models/match.model';
import {
    ValidationRule,
    ValidationContext,
    ValidationResult,
    VALIDATION_RULES
} from '../models/validation.model';

/**
 * Service for validating events and match data
 */
@Injectable({
    providedIn: 'root'
})
export class ValidationService {
    private rules: ValidationRule[] = VALIDATION_RULES;

    /**
     * Validate a single event
     */
    validateEvent(event: LiveEvent, match: Match, allEvents: LiveEvent[]): ValidationResult {
        const context: ValidationContext = {
            event,
            allEvents,
            matchData: match
        };

        return this.runValidation(context);
    }

    /**
     * Validate match statistics
     */
    validateStatistics(statistics: any, match: Match, allEvents: LiveEvent[]): ValidationResult {
        const context: ValidationContext = {
            allEvents,
            matchData: match,
            statistics
        };

        return this.runValidation(context);
    }

    /**
     * Validate all events in a match
     */
    validateAllEvents(match: Match, events: LiveEvent[]): ValidationResult {
        const results: ValidationResult[] = events.map(event =>
            this.validateEvent(event, match, events)
        );

        return this.mergeResults(results);
    }

    /**
     * Add a custom validation rule
     */
    addRule(rule: ValidationRule): void {
        this.rules.push(rule);
    }

    /**
     * Remove a validation rule
     */
    removeRule(ruleId: string): void {
        this.rules = this.rules.filter(r => r.id !== ruleId);
    }

    /**
     * Get all validation rules
     */
    getRules(): ValidationRule[] {
        return [...this.rules];
    }

    /**
     * Get rules by category
     */
    getRulesByCategory(category: string): ValidationRule[] {
        return this.rules.filter(r => r.category === category);
    }

    /**
     * Run validation with current rules
     */
    private runValidation(context: ValidationContext): ValidationResult {
        const results = this.rules.map(rule => rule.validate(context));
        return this.mergeResults(results);
    }

    /**
     * Merge multiple validation results
     */
    private mergeResults(results: ValidationResult[]): ValidationResult {
        return {
            valid: results.every(r => r.valid),
            errors: results.flatMap(r => r.errors),
            warnings: results.flatMap(r => r.warnings)
        };
    }
}

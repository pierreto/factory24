import { Component } from '@angular/core';
import { SudokuService } from '../services/sudoku.service';
import { StopwatchService } from '../services/stopwatch.service';
import { InputService } from '../services/input.service';

@Component({
    selector: 'sudoku-grid',
    templateUrl: '/assets/templates/sudokuGrid.component.html',
    providers: [SudokuService, StopwatchService, InputService]
})
export class SudokuGridComponent {
    isValid: string;
    difficulty: string;

    constructor(private sudokuService: SudokuService,
        private stopwatchService: StopwatchService,
        private inputService: InputService) {
        this.sudokuService = sudokuService;
    }

    getSudokuService() {
        return this.sudokuService;
    }

    getEasySudoku() {
        this.stopwatchService.restart();
        this.sudokuService.getEasySudoku();
    }

    getHardSudoku() {
        this.stopwatchService.restart();
        this.sudokuService.getHardSudoku();
    }

    validateSudoku() {
        this.sudokuService.validateSudoku();
        if (this.sudokuService.isValid === "true") {
            this.stopwatchService.stop();
        }
    }

    resetSudoku() {
        this.sudokuService.resetSudoku();
        this.sudokuService.resetInvalidField();
        this.stopwatchService.restart();
    }

    getStopwatchVisibility(): boolean {
        return this.stopwatchService.isVisible();
    }

    toggleStopwatch() {
        this.stopwatchService.toggleVisibility();
    }

    putEntry(entry: EntryEvent) {
        // Delete the number in the input case
        if (entry.keyEvent.key === "Backspace" || entry.keyEvent.key === "Delete") {
            entry.inputField.value = null;
            entry.inputField.classList.remove("invalid");
            this.sudokuService.putEntry({
                value: 0, row: entry.row, column: entry.column
            });
        }
        // To add a number in the case
        else {
            if (this.inputService.regexCheck(entry.keyEvent.key)) {
                if (this.inputService.validate({
                    value: Number.parseInt(entry.keyEvent.key),
                    grid: this.sudokuService.inputGrid,
                    row: entry.row,
                    column: entry.column
                })) {
                    entry.inputField.classList.remove("invalid");
                }
                else {
                    // Adds invalid class to inputField (for blinking effect)
                    this.sudokuService.putInvalidField(entry.inputField);
                }

                this.sudokuService.putEntry({
                    value: Number.parseInt(entry.keyEvent.key),
                    row: entry.row, column: entry.column
                });
            }
            else {
                entry.keyEvent.preventDefault();
            }
        }
    }
}

interface EntryEvent {
    keyEvent: KeyboardEvent;
    inputField: HTMLInputElement;
    row: number;
    column: number;
}

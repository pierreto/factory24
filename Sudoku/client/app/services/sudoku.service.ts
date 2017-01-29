import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class SudokuService {

    constructor(private http: Http){ }

    getEasySudoku() {
        return this.http.get('http://localhost:3002/getSudoku/easy')
            .map(res => res);
    }

   getHardSudoku() {
        return this.http.get('http://localhost:3002/getSudoku/hard')
            .map(res => res);
    }

   validateSudoku() {
        return this.http.get('http://localhost:3002/validateSudoku')
            .map(res => res);
    }
}

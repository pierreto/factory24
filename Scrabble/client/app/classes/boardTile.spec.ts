/**
 * boardTile.spec.ts
 *
 * @authors Pierre To
 * @date 2017/02/22
 */

import { BoardTile } from './boardTile';
import { Letter } from './letter';

import { expect } from 'chai';

describe('BoardTile', () => {

    let boardTile = new BoardTile("Basic");

    describe('Default constructor', () => {
        it('should construct a BoardTile object.', done => {
            expect(boardTile).to.exist;
            expect(boardTile).to.be.an.instanceOf(BoardTile);
            expect(boardTile.getTileType()).to.be.equal("Basic");
            expect(boardTile.getCharacter()).to.be.null;
            expect(boardTile.getTexture()).to.be.equal("../../assets/textures/board/Basic.png");
            done();
        });
    });

    describe('putLetter()', () => {
        it('should put a Letter on a BoardTile object.', done => {
            let letter = new Letter("A");
            boardTile.putLetter(letter);

            expect(boardTile.getTexture()).to.equal(letter.getTexture());
            done();
        });
    });

    describe('getCharacter()', () => {
        it('should get the character of the Letter (Joker) put on a BoardTile Object.', done => {
            let letter = new Letter("A", true);
            boardTile.putLetter(letter);
            expect(boardTile.getCharacter()).to.equal(letter.getCharacter());
            done();
        });

        it('should not get the character of the Letter (not Joker) put on a BoardTile Object.', done => {
            let letter = new Letter("A");
            boardTile.putLetter(letter);
            expect(boardTile.getCharacter()).to.be.null;
            done();
        });
    });

    describe('removeLetter()', () => {
        it('should put a Letter on a BoardTile object.', done => {
            let letter = new Letter("A");
            expect(boardTile.getTexture()).to.equal(letter.getTexture());
            boardTile.removeLetter();
            expect(boardTile.getTexture()).to.be.equal("../../assets/textures/board/Basic.png");
            done();
        });
    });
});

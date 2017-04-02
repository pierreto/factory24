import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from '../components/app.component';
import { GameComponent } from '../components/game.component';
import { ChatComponent } from '../components/chat.component';
import { BoardComponent } from '../components/board.component';
import { RackComponent } from '../components/rack.component';
import { InfoComponent } from '../components/info.component';
import { WaitingRoomComponent } from '../components/waitingRoom.component';
import { StartPageComponent, WaitingDialogComponent } from '../components/startPage.component';

@NgModule({
    imports: [BrowserAnimationsModule, BrowserModule, FormsModule, AppRoutingModule,
        MaterialModule.forRoot(), FlexLayoutModule.forRoot()],
    declarations: [AppComponent, GameComponent, ChatComponent, BoardComponent, RackComponent, InfoComponent,
        WaitingRoomComponent, StartPageComponent, WaitingDialogComponent],
    entryComponents: [WaitingDialogComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }

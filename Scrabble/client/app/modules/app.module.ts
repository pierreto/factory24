import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { MaterialModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from '../components/app.component';
import { ChatComponent } from '../components/chat.component';
import { BoardComponent } from '../components/board.component';
import { RackComponent } from '../components/rack.component';
import { InfoComponent } from '../components/info.component';
import { WaitingRoomComponent } from '../components/waitingRoom.component'; 

@NgModule({
    imports: [BrowserModule, FormsModule, MaterialModule.forRoot(), FlexLayoutModule.forRoot()],
    declarations: [AppComponent, ChatComponent, BoardComponent, RackComponent, InfoComponent, WaitingRoomComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }

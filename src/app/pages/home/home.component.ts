import { Component, OnInit } from '@angular/core';
import { PubnubService, PubNubConfiguration } from 'src/app/services/pubnub.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private messageSubscription: Subscription;
  private config: PubNubConfiguration = {
    subscribeKey: environment.pubnub.subscribeKey,
    publishKey: environment.pubnub.publishKey,
    uuid: "user-jast",
    autoNetworkDetection: true, // enable for non-browser environment automatic reconnection
    restore: true, // enable catchup on missed messages
  };

  messages: any[] = [];

  constructor(private pubnubSrv: PubnubService) { }

  ngOnInit() { }

  start() {
    if(!this.messageSubscription) {
      this.pubnubSrv.start(this.config);
    
      this.messageSubscription = this.pubnubSrv.getMessageObservable().subscribe({
        next: (message) => {
          this.messages.push(message);
        }
      });
    }
  }

  stop() {
    if(this.messageSubscription) {
      this.pubnubSrv.stop();
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
  }

}

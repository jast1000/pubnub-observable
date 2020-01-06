import { Injectable } from '@angular/core';
import { PubNubAngular } from 'pubnub-angular2';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PubnubService {

  private pubnub;
  private currentListener;

  private currentSpaces: string[] = [];

  private messageSubject = new Subject();
  private presenceSubject = new Subject();
  private signalSubject = new Subject();
  private userSubject = new Subject();
  private spaceSubject = new Subject();
  private membershipSubject = new Subject();
  private messageActionSubject = new Subject();
  private statusSubject = new Subject();

  constructor(private pnAngular: PubNubAngular) { }

  public async start(config: PubNubConfiguration)  {
    if (!this.currentListener) {
      this.createPubNubInstance(config);
      const spaces = await this.getUserSpaces();
      this.currentSpaces = spaces.map(s => s["id"]);
      this.addPubSubListener();
      this.addPubNubSubscriptions(this.currentSpaces);
    }
  }

  public async stop() {
    if (this.currentListener) {
      this.pubnub.unsubscribeAll();
      this.pubnub.removeListener(this.currentListener);
      this.currentListener = null;
      this.currentSpaces = [];
    }
  }

  public getMessageObservable = () => this.messageSubject.asObservable();
  
  public getPresenceObservable = () => this.presenceSubject.asObservable();

  public getSignalObservable = () => this.signalSubject.asObservable();

  public getUserObservable = () => this.userSubject.asObservable();

  public getSpaceObservable = () => this.spaceSubject.asObservable();

  public getMembershipObservable = () => this.membershipSubject.asObservable();

  public getMessageActionObservable = () => this.messageActionSubject.asObservable();

  public getStatusObservable = () => this.statusSubject.asObservable();

  private createPubNubInstance(config: PubNubConfiguration) {
    const instance = this.pnAngular.init(config);
    this.pubnub = instance['pubnubInstance'];
  }

  private getUserSpaces(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.pubnub.getSpaces({ }, (status, response) => {
        if (!status.error) resolve(response.data);
        else reject(status);
      });
    });
  }

  private addPubSubListener() {
    const ref = this;
    this.currentListener = {
      //{channel, subscription, timetoken, message, publisher}
      message: (m) => ref.messageSubject.next(m),
      // {action, channel, occupancy, state, subscription, timestamp, timetoken, uuid}
      presence: (p) => ref.presenceSubject.next(p),
      // {channel, subscription, timetoken, message, publisher}
      signal: (s) => ref.signalSubject.next(s),
      user: (userEvent) => ref.userSubject.next(userEvent),
      space: (spaceEvent) => ref.spaceSubject.next(spaceEvent),
      membership: (membershipEvent) => ref.membershipSubject.next(membershipEvent),
      // {channel, publisher, message.event, message.data.type, message.data.value, message.data.messageTimetoken, message.data.actionTimetoken}
      messageAction: (ma) => this.messageActionSubject.next(ma),
      //{affectedChannelGroups, affectedChannels, category, operation, lastTimetoken, currentTimetoken, subscribedChannels}
      status: (s) => this.statusSubject.next(s)
    };

    this.pubnub.addListener(this.currentListener);
  }

  private addPubNubSubscriptions(spaces: string[]) {
    this.pubnub.subscribe({
      channels: spaces,
      withPresence: true,
    });
  }

}

export interface PubNubConfiguration {
  subscribeKey: string;
  publishKey: string;
  uuid: string;
  autoNetworkDetection?: boolean;
  restore?: boolean;
}
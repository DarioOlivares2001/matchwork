import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RxStomp } from '@stomp/rx-stomp';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChatService,
        {
          provide: RxStomp,
          useValue: {
            configure: () => {},
            publish: () => {},
            connected$: { subscribe: () => ({ unsubscribe: () => {} }) },
            watch: () => ({ subscribe: () => ({ unsubscribe: () => {} }) })
          }
        }
      ]
    });
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
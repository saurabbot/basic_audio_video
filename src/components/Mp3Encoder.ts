import Encoder from "./Encoder";

class MicRecorder {
  private config: {
    bitRate: number;
    startRecordingAt: number;
    deviceId: string | null;
    sampleRate?: number;
  };

  private activeStream: MediaStream | null = null;
  private context: AudioContext | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private timerToStart: NodeJS.Timeout | undefined;
  private startTime = 0;
  private lameEncoder: Encoder | undefined;

  constructor(config: {
    bitRate?: number;
    startRecordingAt?: number;
    deviceId?: string | null;
  }) {
    this.config = {
      bitRate: 128,
      startRecordingAt: 300,
      deviceId: null,
      ...config,
    };
  }

  addMicrophoneListener(stream: MediaStream) {
    this.activeStream = stream;
    this.timerToStart = setTimeout(() => {
      delete this.timerToStart;
    }, this.config.startRecordingAt);
    if (this.context === null) {
      this.context = new (window.AudioContext || window.AudioContext)();
      this.config.sampleRate = this.context.sampleRate;
      this.lameEncoder = new Encoder(this.config);
    }

    this.microphone = this.context.createMediaStreamSource(stream);
    this.processor = this.context.createScriptProcessor(0, 1, 1);
    this.processor.onaudioprocess = (event) => {
      if (this.timerToStart) {
        return;
      }
      if (this.lameEncoder) {
        this.lameEncoder.encode(event.inputBuffer.getChannelData(0));
      }
    };

    if (this.processor) {
      this.microphone.connect(this.processor);
      this.processor.connect(this.context.destination);
    }
  }
  stop() {
    if (this.processor && this.microphone) {
      this.microphone.disconnect();
      this.processor.disconnect();
      if (this.context && this.context.state !== "closed") {
        this.context.close();
      }

      if (this.processor) {
        this.processor.onaudioprocess = null;
      }
      if (this.activeStream) {
        this.activeStream.getAudioTracks().forEach((track) => track.stop());
      }
    }

    return this;
  }

  start(): Promise<MediaStream> {
    const AudioContext = window.AudioContext || window.AudioContext;
    this.context = new AudioContext();
    this.config.sampleRate = this.context.sampleRate;
    this.lameEncoder = new Encoder(this.config);

    const audio = this.config.deviceId
      ? { deviceId: { exact: this.config.deviceId } }
      : true;

    return new Promise<MediaStream>((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio })
        .then((stream) => {
          this.addMicrophoneListener(stream);
          resolve(stream);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }
}

export default MicRecorder;

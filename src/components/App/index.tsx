import { h, Component } from 'preact';

import { bind, drawBitmapToCanvas, linkRef } from '../../lib/util';
import * as style from './style.scss';

import { FileDropEvent } from './custom-els/FileDrop';
import './custom-els/FileDrop';
import './custom-els/CropOverlay';
import CropOverlay from './custom-els/CropOverlay';
import PinchZoom from './custom-els/PinchZoom';
import './custom-els/PinchZoom';

interface Props {}

interface State {
  image?: ImageBitmap;
  loaded: boolean;
  error?: string;
}

export default class App extends Component<Props, State> {
  state: State = {
    loaded: false
  };
  
  canvas?: HTMLCanvasElement;
  cropOverlay?: CropOverlay;
  pinchZoom?: PinchZoom;
  

  constructor() {
    super();
    // In development, persist application state across hot reloads:
    if (process.env.NODE_ENV === 'development') {
      this.setState(window.STATE);
      const oldCDU = this.componentDidUpdate;
      this.componentDidUpdate = (props, state) => {
        if (oldCDU) oldCDU.call(this, props, state);
        window.STATE = this.state;
      };
    }
  }
  
  componentDidUpdate(prevProps: Props, prevState: State): void {
    const { image } = this.state;
    
    if (this.canvas && image) {
      drawBitmapToCanvas(this.canvas, image);
    }
  }

  @bind
  async onImageMoved(event: Event) {
    //console.log(event) 
  }
  
  @bind
  async onCropClicked(event: Event) {
    const image = this.state.image;
    const outputCanvas:HTMLCanvasElement = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');
    
    if (ctx === null) return;
    if (image === undefined) return;
    if (this.pinchZoom === undefined) return;
    if (this.cropOverlay === undefined) return;
    
    const {x, y, scale} = this.pinchZoom;
    const {width, height, offsetX, offsetY} = this.cropOverlay;
    
    const x1 = (-x + offsetX) / scale;
    const y1 = (-y + offsetY) / scale;
  
    const w1 = (width / scale);
    const h1 = (height / scale);
    
    outputCanvas.id = 'debug';
    outputCanvas.width = w1;
    outputCanvas.height = h1;
    
    // Map the source into pinchZoom co-ordinates
    ctx.drawImage(image, x1 , y1, w1, h1, 0, 0, w1, h1);
    
    outputCanvas.toBlob(outputBlob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(outputBlob);
      a.download = 'output-crop.png';
      document.body.appendChild(a)
      a.click();
    });
  }
  
  @bind
  async onFileChange(event: Event): Promise<void> {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    
    this.setState({
      image: await createImageBitmap(file),
      loaded: true
    });
  }

  @bind
  async onFileDrop(event: FileDropEvent) {
    const { file } = event;
    if (!file) return;
    
    this.setState({
      image: await createImageBitmap(file),
      loaded: true
    });
  }

  render({ }: Props, { loaded, error, image }: State) {
    
    const imageAttrs = image ? { height: image.height, width: image.width } : {width: 300, height: 200};
    const imageStyles = { display: (loaded) ? 'none' : 'block' };
    
    return (
      <div class={style.app}>
        <file-drop accept="image/*" onfiledrop={this.onFileDrop}>
          <input type="file" accept="image/*" onChange={this.onFileChange} style={ imageStyles } />
          <pinch-zoom 
            ref={linkRef(this, 'pinchZoom')}
            onChange={this.onImageMoved}>
            <canvas 
              ref={linkRef(this, 'canvas')}
              width={imageAttrs.width}
              height={imageAttrs.height} />
            </pinch-zoom>
        </file-drop>
        <crop-overlay
          ref={linkRef(this, 'cropOverlay')}></crop-overlay>
        <button id="crop" onClick={this.onCropClicked}>Crop</button>
      </div>
    );
  }
}

import { bind } from '../../../../lib/util';
import './styles.css';

/*
  Example Usage.
  <crop-overlay>
   [everything in here is a drop target.]
  </crop-overlay>
*/
export default class CropOverlay extends HTMLElement {
  
  private _width = 0;
  private _height = 0;
  private _offsetX = 0;
  private _offsetY = 0;

  @bind
  private _setBorderSize() {
    const [width, height] = [window.innerWidth, window.innerHeight];
    const bestSize = Math.min(width, height);
    
    this._width = bestSize - 64;
    this._height = bestSize - 64;
    this._offsetX= (width - bestSize + 64) / 2;
    this._offsetY = (height - bestSize + 64) / 2;
    
    this.style.borderLeftWidth = `${this._offsetX}px`;
    this.style.borderRightWidth = `${this._offsetX}px`;
    this.style.borderTopWidth = `${this._offsetY}px`;
    this.style.borderBottomWidth = `${this._offsetY}px`;
  }
  
  get offsetX() {
    return this._offsetX;
  }
  
  get offsetY() {
    return this._offsetY;
  }
   
  get width() {
    return this._width;
  }
   
  get height() {
    return this._height;
  }
  
  constructor() {
    super();
    window.addEventListener('resize', (event) => this._setBorderSize())
  }
   
  connectedCallback() {
    this._setBorderSize();
  }
  
} 

customElements.define('crop-overlay', CropOverlay);

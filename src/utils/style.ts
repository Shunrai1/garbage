import { Circle, Fill, RegularShape, Stroke, Style, Icon } from 'ol/style'

//图层Style样式
/**
 * 垃圾投放点
 */
export const gSiteStyle = new Style({
  /**{olx.style.IconOptions}类型*/
  image: new Icon({
    anchor: [0.5, 0],
    anchorOrigin: 'bottom-right',
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    // offsetOrigin: 'top-right',
    // offset:[0,10],
    //图标缩放比例
    // scale:0.5,
    //透明度
    // opacity: 0.75,
    //图标的url
    src: '../../public/img/p2.png',
  }),
})
export const gStationStyle = new Style({
  /**{olx.style.IconOptions}类型*/
  image: new Icon({
    anchor: [0.5, 0],
    anchorOrigin: 'bottom-right',
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    //图标的url
    src: '../../public/img/p3.png',
  }),
})
export const gProcessStyle = new Style({
  /**{olx.style.IconOptions}类型*/
  image: new Icon({
    anchor: [0.5, 0],
    anchorOrigin: 'bottom-right',
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    //图标的url
    src: '../../public/img/p5.png',
  }),
})
export const depotStyle = new Style({
  /**{olx.style.IconOptions}类型*/
  image: new Icon({
    anchor: [0.5, 0],
    anchorOrigin: 'bottom-right',
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    //图标的url
    src: '../../public/img/p1.png',
  }),
})
export const selectStyle = new Style({
  /**{olx.style.IconOptions}类型*/
  image: new Icon({
    anchor: [0.5, 0],
    anchorOrigin: 'bottom-right',
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    //图标的url
    src: '../../public/img/i1.png',
  }),
})
export const highlightLineStyle = new Style({
  stroke: new Stroke({
    color: 'rgb(87,206,240)',
    width: 4,
  }),
})
export const candidateStyle = new Style({
  /**{olx.style.IconOptions}类型*/
  image: new Icon({
    anchor: [0.5, 0],
    anchorOrigin: 'bottom-right',
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    //图标的url
    src: '../../public/img/p4.png',
  }),
})

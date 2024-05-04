import { Rain, Reservoir, River } from '@/api/Water/type'
import { Map, Overlay } from 'ol'
import { Pixel } from 'ol/pixel'
import { Ref } from 'vue'
import * as echarts from 'echarts'
import { fromLonLat } from 'ol/proj'
/**
 * 实现popup功能
 * @param pLen
 * @param map
 * @param pixel
 * @param attribute
 * @param refs
 */
export const usePopup = (
  pLen: number,
  map: Map,
  pixel: Pixel,
  attribute: any,
  refs: {
    popupRef: Ref<any>
    popupContentRef: Ref<any>
    popupCloserRef: Ref<any>
    titleVisible: Ref
    address?: Ref
    area?: Ref
    label?: Ref
    description?: Ref
    street?: Ref
    name?: Ref
    number?: Ref
    deal?: Ref
    gstype?: Ref
    buildarea?: Ref
    department?: Ref
    unit?: Ref
    station?: Ref
    cmethod?: Ref
    dmethod?: Ref
    popupVisible: Ref<boolean>
  },
  type: string,
) => {
  const {
    popupVisible,
    titleVisible,
    area,
    label,
    address,
    description,
    street,
    name,
    number,
    deal,
    gstype,
    buildarea,
    department,
    unit,
    station,
    cmethod,
    dmethod,
    popupContentRef,
    popupRef,
    popupCloserRef,
  } = refs
  popupVisible.value = true
  //清除已有echart实例
  // myChart.value?.dispose()

  // let myChart: any
  //新建覆盖物
  const overlay = new Overlay({
    element: popupRef.value,
    //当前窗口可见
    // autoPan: true,
    // positioning: 'bottom-center',
    // offset: [0, 20],
  })
  /**
   * 添加关闭按钮的单击事件（隐藏popup）
   * @return {boolean} Don't follow the href.
   */
  popupCloserRef.value.onclick = function () {
    //未定义popup位置
    overlay.setPosition(undefined)
    //失去焦点
    popupCloserRef.value.blur()
    return false
  }
  //垃圾投放点
  if (type == 'gSite') {
    titleVisible.value = true
    if (pLen === 1) {
      popupContentRef.value.innerHTML = ''
      // getEventPixel(evt.originalEvent) 是在地图点击事件中获取点击位置的像素坐标。
      map.forEachFeatureAtPixel(pixel, function () {
        popupContentRef.value.innerHTML = ''
        //新增div元素
        const elementDiv = document.createElement('div')
        elementDiv.className = 'markerText'
        setInnerText(elementDiv, `${attribute.userName}`)
        ;(area!.value = attribute.area),
          (label!.value = attribute.label),
          (description!.value = attribute.description),
          (street!.value = attribute.street),
          (address!.value = attribute.address)

        // 为content添加div子节点
        popupContentRef.value.appendChild(elementDiv)
        overlay.setPosition(attribute.coordinate)
        map.addOverlay(overlay)
      })
    } else {
      console.log('plen')
    }
  }
  //垃圾中转站
  if (type == 'gStation') {
    titleVisible.value = true
    popupContentRef.value.innerHTML = ''
    map.forEachFeatureAtPixel(pixel, function () {
      popupContentRef.value.innerHTML = ''
      //新增div元素
      const elementDiv = document.createElement('div')
      elementDiv.className = 'markerText'
      setInnerText(elementDiv, `${attribute.userName}`)
      area!.value = attribute.area
      description!.value = attribute.description
      street!.value = attribute.street
      name!.value = attribute.name
      address!.value = attribute.address
      ;(number!.value = attribute.number),
        (deal!.value = attribute.deal),
        (gstype!.value = attribute.gstype),
        (buildarea!.value = attribute.buildarea),
        (department!.value = attribute.department),
        (unit!.value = attribute.unit),
        (station!.value = attribute.station),
        (cmethod!.value = attribute.cmethod),
        (dmethod!.value = attribute.dmethod),
        // 为content添加div子节点
        popupContentRef.value.appendChild(elementDiv)
      overlay.setPosition(attribute.coordinate)
      map.addOverlay(overlay)
    })
  }
  //垃圾处理站
  if (type == 'gProcess') {
    titleVisible.value = true
    popupContentRef.value.innerHTML = ''
    map.forEachFeatureAtPixel(pixel, function () {
      popupContentRef.value.innerHTML = ''
      //新增div元素
      const elementDiv = document.createElement('div')
      elementDiv.className = 'markerText'
      setInnerText(elementDiv, `${attribute.userName}`)
      description!.value = attribute.description
      name!.value = attribute.name
      // 为content添加div子节点
      popupContentRef.value.appendChild(elementDiv)
      overlay.setPosition(attribute.coordinate)
      map.addOverlay(overlay)
    })
  }
  //   //台风预测路径
  //   if (type == 'typhoonForecastPoint') {
  //     titleVisible.value = false
  //     waterVisible.value = false
  //     rainVisible.value = false
  //     typhoonVisible.value = true
  //     forecast.value = attribute.forecast
  //     tm.value = attribute.tm
  //     lonlat.value = attribute.coordinate
  //     windstrong.value = attribute.windstrong
  //     windspeed.value = attribute.windspeed
  //     movespeed.value = attribute.movespeed
  //     movedirect.value = attribute.movedirect
  //     overlay.setPosition(fromLonLat(attribute.coordinate))
  //     map.addOverlay(overlay)
  //   }
}
/**
 * 动态设置元素文本内容（兼容）
 */
function setInnerText(element: any, text: any) {
  if (typeof element.textContent == 'string') {
    element.textContent = text
  } else {
    element.innerText = text
  }
}

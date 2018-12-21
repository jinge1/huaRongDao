import Swipe from './VSwipe'

/**
 * [Huarongdao 华容道游戏类，类似华容道游戏使用]
 */
export default class Huarongdao {
  /**
   * [constructor 初始化操作]
   * @param {Object} roles      [角色列表，{role: '角色类型标识', hSize: '横轴单位长度个数', vSize: '纵轴单位长度个数'}]
   * @param {Object} layout     [布局列表, {role: '角色类型标识', x: '横轴单位坐标', y: '纵单位坐标'}]
   * @param {String} datasetKey [通过元素的dataset来获取元素下标的key字符串，默认为index]
   * @param {Number} hSize      [横轴总单位长度个数，单位长度：最小角色宽度为1]
   * @param {Number} vSize      [纵轴总单位长度个数，没有该参数则取hSize值]
   * @param {Number} spaceScale [角色间隙比例值，为与横轴方向总长度所占比例值]
   * @param {Number} width      [横轴总长度]
   */
  constructor({
    ele,
    roles,
    layout,
    datasetKey,
    hSize,
    vSize,
    spaceScale
  }) {
    this.ele = typeof ele === 'string'
      ? document.querySelector(ele)
      : ele
    this.roles = [...roles]
    this.layout = [...layout]
    this.datasetKey = datasetKey || 'index'
    this.hSize = hSize
    this.vSize = vSize
      ? vSize
      : hSize
    this.spaceScale = spaceScale
    this.init()
    this.setSwipe()
  }

  /**
   * [init 初始化，计算间隙宽度，单位长度，整体高度等，并进行初始渲染]
   */
  init() {
    let {ele, hSize, vSize, spaceScale} = this
    let totalWidth = parseInt(document.defaultView.getComputedStyle(ele, null).width)
    let spaceWidth = parseInt(totalWidth * spaceScale)
    let singleWidth = parseInt((totalWidth - spaceWidth * (hSize + 1)) / hSize)
    this.spaceWidth = spaceWidth
    this.singleWidth = singleWidth
    this.totalWidth = totalWidth
    this.totalHeight = vSize * (spaceWidth + singleWidth) + spaceWidth
    this.renderList = this.getRenderList()
  }

  /**
   * [getRenderList 结合角色列表roles与布局列表layout，生成渲染列表renderList]
   */
  getRenderList() {
    let {layout} = this
    let renderList = []
    layout.forEach(item => {
      let renderInfo = this.getRenderDetail(item)
      renderList.push({
        ...renderInfo
      })
    })
    return renderList
  }

  /**
   * [getRenderDetail 根据某个布局信息，生成布局详情]
   * @param  {Number} role [角色类型]
   * @param  {Number} x    [角色x轴坐标点相对单位长度个数]
   * @param  {Number} y    [角色y轴坐标点相对单位长度个数]
   * @return {Object}      [具体布局信息]
   */
  getRenderDetail({role, x, y}) {
    let {roles, spaceWidth, singleWidth} = this
    let roleInfo = roles.find(({role: itemRole}) => itemRole === role)
    let {
      hSize,
      vSize,
      ...other
    } = roleInfo
    let width = hSize * singleWidth + (hSize - 1) * spaceWidth
    let height = vSize * singleWidth + (vSize - 1) * spaceWidth
    let left = x * singleWidth + spaceWidth * (x + 1)
    let top = y * singleWidth + spaceWidth * (y + 1)
    return {
      width,
      height,
      left,
      top,
      ...other
    }
  }

  /**
   * [给元素绑定滑动事件]
   */
  setSwipe() {
    let {ele} = this
    let hSwipe = new Swipe(ele)

    hSwipe.start = (e) => {
      this.moveIndex = -1
      this.beforeMove(e)
    }

    hSwipe.move = (e) => {
      this.onMove(e)
    }

    hSwipe.end = () => {
      this.endMove()
    }

    this.hSwipe = hSwipe
  }

  /**
   * [beforeMove 开始滑动的处理]
   * @param  {Object} e [事件对象]
   */
  beforeMove(e) {
    let {datasetKey, startEvent} = this

    let index = -1
    let lockDirection = ''
    if (e && e.target) {
      let datasetIndex = e.target.dataset[datasetKey]
      if (!isNaN(datasetIndex)) {
        index = datasetIndex
      }
    }

    this.moveIndex = index
    this.lockDirection = lockDirection
    this.isGetLimit = false

    if (typeof startEvent === 'function') {
      this.startEvent(e)
    }
  }

  /**
   * [onMove 滑动中的处理]
   * @param  {Object} e [事件对象]
   */
  onMove(e) {
    let {lockDirection, moveIndex, moveEvent, hSwipe, isGetLimit} = this
    if (moveIndex < 0) {
      return false
    }

    let {moveInfo, lastInfo} = hSwipe
    let {differX, differY} = moveInfo
    let {lastDirection} = lastInfo

    // 锁定方向设置
    if (lockDirection === '') {
      lockDirection = lastDirection
    }

    // 修正运动方向（lastDirection可能为空）
    if (lastDirection === '') {
      lastDirection = lockDirection
    }

    // 未发生位移，不处理
    if (lockDirection === '') {
      return false
    }

    if (lastDirection === lockDirection) {
      // 设置锁定信息
      this.lockDirection = lockDirection
      if(!isGetLimit){  // 如果未获取可滑动极限值，则先获取
        this.limitInfo = this.getLimitInfo(lockDirection)
        this.isGetLimit = true
      }
      this.changeRender(differX, differY)
    } else {
      this.setChangeInfo(lastDirection, differX, differY)
      this.changeRender(differX, differY)
    }

    if (typeof moveEvent === 'function') {
      this.moveEvent(e)
    }
  }

  /**
   * [changeRender 更新位置信息]
   * @param  {Number} differX [水平位移距离，相对于起始位置]
   * @param  {Number} differY [垂直位移距离，相对于起始位置]
   */
  changeRender(differX, differY){
    let {
      moveIndex,
      limitInfo,
      lockDirection,
      layout
    } = this
    let {
      max,
      min
    } = limitInfo
    let {left, top} = this.getRenderDetail(layout[moveIndex])
    let nextLeft = left + differX
    let nextTop = top + differY
    if(lockDirection === 'h'){
      if(nextLeft < min){
        nextLeft = min
      }
      if(nextLeft > max){
        nextLeft = max
      }
      this.renderList[moveIndex].left = nextLeft
      this.updatePosition()
    }
    if(lockDirection === 'v'){
      if(nextTop < min){
        nextTop = min
      }
      if(nextTop > max){
        nextTop = max
      }
      this.renderList[moveIndex].top = nextTop
      this.updatePosition()
    }
  }

  /**
   * [updatePosition 更新坐标后的回调事件处理]
   */
  updatePosition(){
    let {update} = this
    if (typeof update === 'function') {
      this.update()
    }
  }

  /**
   * [setChangeInfo 判断是否需要改变运动方向，并设置该变量]
   * @param {String} lastDirection [改变运动的方向，h: 水平方向，v: 垂直方向]
   * @param {Number} differX       [水平偏移量]
   * @param {Number} differY       [垂直偏移量]
   */
  setChangeInfo(lastDirection, differX, differY){
    let {
      moveIndex,
      layout,
      renderList,
      singleWidth,
      spaceWidth
    } = this
    let {
      left: currentLeft,
      top: currentTop
    } = renderList[moveIndex]
    let {left, top} = this.getRenderDetail(layout[moveIndex])

    let nextLeft = left + differX
    let nextTop = top + differY

    if(lastDirection === 'h'){
      // 计算距离最近单位长度的差距
      let changeH = Math.round( currentTop/(spaceWidth + singleWidth) )
      let changeNum = Math.abs( changeH * (spaceWidth + singleWidth) - currentTop)
      if( changeNum <= spaceWidth ){
        let limitInfo = this.getLimitInfo(lastDirection)
        let {
          min,
          max
        } = limitInfo
        if((nextLeft - currentLeft < 0 ) && currentLeft > min || (nextLeft - currentLeft > 0 && currentLeft < max)){
          this.limitInfo = limitInfo
          // 修正纵轴坐标
          this.renderList[moveIndex].top = changeH * (spaceWidth + singleWidth) + spaceWidth
          this.lockDirection = lastDirection
          this.updatePosition()
        }
      }
    }

    if(lastDirection === 'v'){
      // 计算距离最近单位长度的差距
      let changeV = Math.round( currentLeft/(spaceWidth + singleWidth) )
      let changeNum = Math.abs( changeV * (spaceWidth + singleWidth) - currentLeft)
      if( changeNum <= spaceWidth * 1.5 ){
        let limitInfo = this.getLimitInfo(lastDirection)
        let {
          min,
          max
        } = limitInfo
        if((nextTop - currentTop < 0 ) && currentTop > min || (nextTop - currentTop > 0 && currentTop < max)){
          this.limitInfo = limitInfo
          // 修正纵轴坐标
          this.renderList[moveIndex].left = changeV * (spaceWidth + singleWidth) + spaceWidth
          this.lockDirection = lastDirection
          this.updatePosition()
        }
      }
    }

  }

  /**
   * [getLimitInfo 判断当前元素在某个运动方向的极限值]
   * @param  {String} direction [运动方形， h: 横轴，v: 纵轴]
   * @return {Object}           [极限值数据]
   */
  getLimitInfo(direction){
    let {
      moveIndex,
      renderList,
      spaceWidth,
      totalWidth,
      totalHeight
    } = this
    let {
      left: currentLeft,
      top: currentTop,
      width: currentWidth,
      height: currentHeight
    } = renderList[moveIndex]

    let max = 0
    let min = spaceWidth
    let limitInfo = {}
    if(direction === 'h'){
      // 查找横轴可能阻挡元素的最邻近坐标值，以此来确定可移动范围
      max = totalWidth - spaceWidth - currentWidth
      renderList.forEach(({
        left: itemLeft,
        top: itemTop,
        width: itemWidth,
        height: itemHeight
      }, index)=>{
        // 右侧元素的横轴满足条件
        let isRight = itemLeft > currentLeft + currentWidth
        // 横轴元素的横轴满足条件
        let isLeft = itemLeft + itemWidth < currentLeft
        // 可能阻挡元素的纵轴满足条件
        let isV = (itemTop >= currentTop && itemTop < currentTop + currentHeight) || (itemTop < currentTop && itemTop + itemHeight > currentTop)
        if(isRight && isV){ // 找出右侧首个阻挡元素的横坐标
          let nextMax = itemLeft - spaceWidth - currentWidth
          max = nextMax < max ? nextMax : max
        }
        if(isLeft && isV){ // 找出左侧首个阻挡元素的横坐标
          let nextMin = itemLeft + itemWidth + spaceWidth
          min = nextMin > min ? nextMin : min
        }
      })

      limitInfo = {
        max,
        min
      }
    }

    if(direction === 'v'){
      // 查找纵轴可能阻挡元素的最邻近坐标值，以此来确定可移动范围
      max = totalHeight - spaceWidth - currentHeight
      renderList.forEach(({
        left: itemLeft,
        top: itemTop,
        width: itemWidth,
        height: itemHeight
      }, index)=>{
        let isDown = itemTop > currentTop + currentHeight
        let isUp = itemTop + itemHeight < currentTop
        let isH = (itemLeft >= currentLeft && itemLeft < currentLeft + currentWidth) || (itemLeft < currentLeft && itemLeft + itemWidth > currentLeft)
        if(isDown && isH){
          let nextMax = itemTop - spaceWidth - currentHeight
          max = nextMax < max ? nextMax : max
        }
        if(isUp && isH){
          let nextMin = itemTop + itemHeight + spaceWidth
          min = nextMin > min ? nextMin : min
        }
      })

      limitInfo = {
        max,
        min
      }
    }

    return limitInfo
  }

  /**
   * [onMove 滑动结束的处理]
   */
  endMove() {
    let {
      moveIndex,
      renderList,
      singleWidth,
      spaceWidth,
      beforeEnd
    } = this
    if (moveIndex < 0) {
      return false
    }
    if (typeof beforeEnd === 'function') {
      this.beforeEnd()
    }

    let {left, top, role} = renderList[moveIndex]
    let x = Math.round(left / (singleWidth + spaceWidth))
    let y = Math.round(top / (singleWidth + spaceWidth))

    let {left: nextLeft, top: nextTop} = this.getRenderDetail({
      role,
      x,
      y
    })

    this.layout[moveIndex].x = x
    this.layout[moveIndex].y = y
    this.renderList[moveIndex].left = nextLeft
    this.renderList[moveIndex].top = nextTop

    if (typeof endEvent === 'function') {
      this.endEvent()
    }
  }

}

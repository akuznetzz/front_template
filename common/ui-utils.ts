export function getRect(elem: any) {
    let _left = 0;
    let _top = 0;
    let _height = elem.offsetHeight;
    let _width = elem.offsetWidth;
    while(elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
      _left += elem.offsetLeft - elem.scrollLeft;
      _top += elem.offsetTop - elem.scrollTop;
      elem = elem.offsetParent;
    }
    return {
      top: _top,
      left: _left,
      bottom: _height + _top,
      right: _width + _left,
    };
}

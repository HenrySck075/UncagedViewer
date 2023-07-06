function makeDragable(dragHandle, dragTarget) {
  // used to prevent dragged object jumping to mouse location
  let xOffset = 0;
  let yOffset = 0;

  let handle = document.querySelector(dragHandle);
  handle.addEventListener("mousedown", startDrag, true);
  handle.addEventListener("touchstart", startDrag);

  /*sets offset parameters and starts listening for mouse-move*/
  function startDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    let dragObj = document.querySelector(dragTarget);
    
    // shadow element would take the original place of the dragged element, this is to make sure that every sibling will not reflow in the document
    // let shadow = dragObj.cloneNode();
    // shadow.id = ""
    // // You can change the style of the shadow here
    // shadow.style.opacity = 0.5
    // dragObj.parentNode.insertBefore(shadow, dragObj.nextSibling);

    let rect = dragObj.getBoundingClientRect();
    dragObj.style.left = rect.left;
    dragObj.style.top = rect.top;
    dragObj.style.position = "absolute";

    /*Drag object*/
    function dragObject(e) {
      e.preventDefault();
      e.stopPropagation();
      if(e.type=="mousemove") {
        dragObj.style.left = e.clientX-xOffset + "px"; // adjust location of dragged object so doesn't jump to mouse position
        dragObj.style.top = e.clientY-yOffset + "px";
      } else if(e.type=="touchmove") {
        dragObj.style.left = e.targetTouches[0].clientX-xOffset +"px"; // adjust location of dragged object so doesn't jump to mouse position
        dragObj.style.top = e.targetTouches[0].clientY-yOffset +"px";
      }
    }
    /*End dragging*/
    document.addEventListener("mouseup", function() {
      // hide the shadow element, but still let it keep the room, you can delete the shadow element to let the siblings reflow if that is what you want
      window.removeEventListener('mousemove', dragObject, true);
      window.removeEventListener('touchmove', dragObject);
    }, true)

    if (e.type=="mousedown") {
      xOffset = e.clientX - rect.left; //clientX and getBoundingClientRect() both use viewable area adjusted when scrolling aka 'viewport'
      yOffset = e.clientY - rect.top;
      window.addEventListener('mousemove', dragObject, true);
    } else if(e.type=="touchstart") {
      xOffset = e.targetTouches[0].clientX - rect.left;
      yOffset = e.targetTouches[0].clientY - rect.top;
      window.addEventListener('touchmove', dragObject);
    }
  }
}
$(function (){
    var imageRecordObj = {}; // 记录点击的目标.
    var mouseX = 0, mouseY = 0;
    var rootImgPath = "image/";
    var imageIdList = null; // [id1, id2, id3, ...]
    var imageLabelObj = null; // {xx: label1, ...}
//    var imageName = null;
    function mouseMove(ev){
        function mousePosition(ev){
              if(ev.pageX || ev.pageY){
                 return {x:ev.pageX, y:ev.pageY};
              }
              return {
                 x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
                 y:ev.clientY + document.body.scrollTop  - document.body.clientTop
              };
         }
        ev = ev || window.event;
        var mousePos = mousePosition(ev);
        mouseX = mousePos.x;
        mouseY = mousePos.y;
    }

    document.onmousemove = mouseMove;

    function processImage(imgPath, imgIdx){
        var imgSize = [224, 224];
        var imageName = imageIdList[imgIdx];
        if(Object.keys(imageRecordObj).indexOf() == -1){ // 不存在
           imageRecordObj[imageName] = []; // {"jj": [], ...}
        }
        $("#img-box > *").remove(); // 清空子元素.
        $(".marker-click").remove(); // 清空元素.
        $(".img-label").text("Label: " + imageLabelObj[imageName]);
        d3.select("#img-box")
          .append("img")
          .attr("id", "cur-img")
          .attr("width", imgSize[0])
          .attr("height", imgSize[1])
          .attr("src", imgPath + imageName) // "image/" + "xxx.jpeg"
          .on("click", function (){
              var imgElement = document.getElementById("cur-img"); // 获得img
              var x = parseInt(mouseX)-imgElement.offsetLeft;
              var y = parseInt(mouseY)-imgElement.offsetTop;
              var color = 'red'; // 标上颜色.
              var size = 8;
              $("body").append(
              $("<div class='marker-click'></div>")
                  .css('position', 'absolute')
                  .css('top', (mouseY - size / 2) + 'px')
                  .css('left', (mouseX - size / 2) + 'px')
                  .css('width', size + "px")
                  .css('height', size + "px")
                  .css('background-color', color));
//              alert(x + " " + y);
              imageRecordObj[imageName].push([x, y]);



         });
    }
    function showImg(){
        d3.json("image/imageLabel.json", function(data){ // 异步操作.
            imageIdList = data.imgName;
            imageLabelObj = data.imgLabel; // {xx: x, ...}
//            console.log(data);
            processImage(rootImgPath, 0);
        }); // imageId.json
    }
    showImg();

    function clickCounter(){ // 闭包
        var countClick = 0;
        return function(){
          return ++countClick;
        };
    }
    var count = clickCounter();

    function timeFormat(timestamp){
        //timestamp是整数，否则要parseInt转换,不会出现少个0的情况
        function add0(m){return m<10?'0'+m:m }
        var time = new Date(timestamp);
        var year = time.getFullYear();
        var month = time.getMonth()+1;
        var date = time.getDate();
        var hours = time.getHours();
        var minutes = time.getMinutes();
        var seconds = time.getSeconds();
        return year+'-'+add0(month)+'-'+add0(date)+' '+add0(hours)+':'+add0(minutes)+':'+add0(seconds);
    }

    $("#next-button").click(function(){
       var curIndex = count();
       console.log("curIndex");
       console.log(curIndex);
       if(curIndex < imageIdList.length){
         processImage(rootImgPath, curIndex);
       }else{
         $("#img-box > *").remove(); // 清空子元素.
         $(".marker-click").remove(); // 清空元素.
         $(".img-label").text("");
         $("#next-button").remove();
         $("#img-box").text("已完成标注. 谢谢!");
         var content = JSON.stringify(imageRecordObj); // 对象转化成json字符串.
         var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
         var timeStamp = Date.parse(new Date());
         var localTime = timeFormat(timeStamp);
         saveAs(blob, localTime + "_user_result.json");
       }

    });



});

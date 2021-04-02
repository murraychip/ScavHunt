var canvas = null;
var context;

var xRatio = .5;
var yRatio = .5;
var allPages = [];
var currentPageIndex = 0;
var showHint = false;
var baseImgAddress = "Pictures/";

function addPage(settings) { 
    allPages.push(settings); 
} 
function leftClick() {
    loadPage(currentPageIndex - 1);
}
function rightClick() {
    loadPage(currentPageIndex + 1);
}
function resetClick() {
    if (showHint)
        hintClick();

    loadPage(currentPageIndex);
    setMagnification(1);
}
function hintClick() {
    if (showHint) {
        $("#listHolder").removeClass("easyFind");
        $("#hintBtn").html(" Show Hints ");
        showHint = false;
    }
    else { 

        $("#listHolder").addClass("easyFind");
        $("#hintBtn").html(" Hide Hints ");
        showHint = true; 
    }
}

function loadPage(index) {
    $("ul,img,area,map").on("contextmenu", function (e) { e.preventDefault(); return false;})
    $("#victoryMessage").hide();

    currentPageIndex = index;
    var settings = allPages[index];

    loadMain(settings.title, settings.imgSrc, function () {
        if (settings.hideHintButton) { 
            $("#hintBtn").css("visibility", "hidden");
        }
        else {
            $("#hintBtn").css("visibility", "visible");
            if (showHint)
                $("#listHolder").addClass("easyFind");
        }
        for (var i = 0; i < settings.items.length; i++) {
            var item = settings.items[i];
            loadItem( item.label, item.coords, item.inline, item.newSentence, item.padleft); 
        }
        magnify(currentZoom);
    })

    $("#leftBtn").css("visibility", currentPageIndex != 0 ? "visible" : "hidden");
    $("#rightBtn").css("visibility", currentPageIndex != (allPages.length - 1) ? "visible" : "hidden");
}

function loadMain(title, imgLocation, afterLoad) {
    $("#hintBtn").css("visibility", "visible");
    $("#resetBtn").css("visibility", "hidden");
    $("#pageName").text(title);
    $("#pictureHolder").prop("src", baseImgAddress + imgLocation).one("load", function () {  
        if (this.naturalWidth > this.naturalHeight) 
            $(this).css("width", "100%").css("height", ""); 
        else
            $(this).css("height", "100%").css("width", "");

        var imgHeight = $(this).height();
        var imgWidth = $(this).width();

        xRatio = imgWidth / this.naturalWidth;
        yRatio = imgHeight / this.naturalHeight;
        var jCanvas = $("canvas");
        jCanvas
            .width(imgWidth)
            .height(imgHeight)

        var docCanvas = jCanvas[0];
        docCanvas.height = jCanvas.height();
        docCanvas.width = jCanvas.width();
        context = docCanvas.getContext('2d');
        context.clearRect(0, 0, docCanvas.width, docCanvas.height);

        afterLoad();
    });
    $("#textHolder").html("<ul id=listHolder ></ul");
    $("map").empty();
}
function loadItem(description, coords, bInline, bNewSentence, bPadLeft) {
    var li = $("<li>" + description + "</li>");
    if (bInline)
        li.addClass("inline");
    else if (bNewSentence)
        li.addClass("newSentence");
    if (bPadLeft) {
        li.addClass("padLeft");
    }

    $("#listHolder").append(li);

    if (coords == null || coords.length == 0 || typeof(coords) == "undefined") {
        li.addClass("textOnly");
    }
    else {
        li.data("numitems", coords.length);
        var runningLeft = 0;
        for (var i = 0; i < coords.length; i++) {
            addToMap(description, li,
                coords[i][0],
                coords[i][1], 
                coords[i][2],
                i, runningLeft);

            runningLeft += ( coords[i][2] * 2 ) + 10 //radius * 2 plus a bit of padding
        }
    }
}
function showPreview(mapItem, li, x, y, radius, index, baseLeft) {
    var convertedX = x * xRatio;
    var convertedY = y * yRatio;
    var convertedRadius = radius * xRatio;

    var previewContainer = $("#preview");
    if (previewContainer.length == 0) {
        previewContainer = $("<div id=preview>");
        li.append(previewContainer);
    }
    else if (li.find("#preview").length == 0) {
        li.append(previewContainer);
        previewContainer.empty();
    }
    var previewItem = $("#previewItem" + index);
    if (previewItem.length == 0) {
        previewItem = $("<div>");
        previewItem.addClass("previewSubItem");
        previewItem.css("left", baseLeft + "px")
        previewItem.prop("id", "previewItem" + index);
        previewContainer.append(previewItem);

        previewItem.on("click", function (e) {
            foundItem(mapItem, li, index, x, y, radius, "red")
            showPreview(mapItem, li, x, y, radius, index, baseLeft);
            e.preventDefault();
            return false;
        });
    } 

    if (li.data("founditem" + index) == 1) {
        if (previewItem.find(".found").length == 0)
            previewItem.append("<div class=found>");
    }

 ;
    var top = y- radius;
    var left = x - radius;
    previewItem.css("background-image", "url('" + $("#pictureHolder").prop("src") + "')");
    previewItem.css("background-position", (left * -1) + "px " + (top * -1) + "px ");

    previewItem.height(radius * 2).width(radius * 2)


    $("#preview").show();
    setTimeout(function () {
        $("body").one("click", function () {
            hidePreview();
        })
    }, 50);
}
function hidePreview() {
    $("#preview").hide();//.empty();
}
 
function foundItem(maparea, li, index, x, y, radius, color) {
    var convertedX = x * xRatio;
    var convertedY = y * yRatio;
    var convertedRadius = radius * xRatio;

    $("#resetBtn").css("visibility", "visible");

    if (li.data("founditem" + index) == 1)
        return;

    //mark the text block as having found this item (could be multiple items per block)
    li.data("founditem" + index, 1);

    //draw the circle
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.arc(convertedX, convertedY, convertedRadius, 0, 2 * Math.PI);
    context.stroke();

    //removing the maparea eases some problems with overlapping areas
    maparea.remove();

    var totalSubItems = li.data("numitems");
    if (totalSubItems > 1) {
        var nFound = 0;
        for (var i = 0; i < totalSubItems; i++) {
            if (li.data("founditem" + i) == 1) {
                nFound++;
            }
        }
        if (nFound < totalSubItems) {
            li.addClass("partial");
            li.attr("data-partialcontent", " (" + nFound + "/" + totalSubItems + ")");
            return;
        } 
    } 

    li.removeClass("partial");
    li.addClass("found"); 
    if ($("#textHolder li:not(.found):not(.textOnly)").length == 0) {
        setTimeout(function () {
            triggerSuccess();
        }, 50);
    }
}
 
function triggerSuccess() {
    var msg = "Good Job!!! You found all the items on this page.";
    $("#victoryMessage").html(msg).show(); 
}
function addToMap(description, li, x, y, radius, index, baseLeft) {
    var convertedX = x * xRatio;
    var convertedY = y * yRatio;
    var convertedRadius = radius * xRatio;

    var strCoords = convertedX + "," + convertedY + "," + convertedRadius;

    var mapItem = $("<area>");
    mapItem.attr("alt", description);
    mapItem.attr("shape", "circle");
    mapItem.attr("coords", strCoords);
 //   mapItem.attr("href", "#");
    $("map").append(mapItem);

    mapItem.on("click", function () {
        foundItem(mapItem, li, index, x, y, radius, "blue");
        hidePreview();
        return false;
    }); 
    li.on("click", function (e) {
        if (!showHint)
            return;

        showPreview(mapItem, li, x, y, radius, index, baseLeft);
        e.preventDefault();
        return false;
    })
}



var currentZoom = 1;
function magnify( zoom) {
    currentZoom = zoom;
    var imgID = "pictureHolder";
    var img, glass, w, h, bw;
    img = document.getElementById(imgID);

    $(".img-magnifier-glass").remove();
    if (zoom == 1)
        return;

    /* Create magnifier glass: */
    glass = document.createElement("DIV");
    glass.setAttribute("class", "img-magnifier-glass");

    /* Insert magnifier glass: */
    img.parentElement.insertBefore(glass, img);

    /* Set background properties for the magnifier glass: */
    glass.style.backgroundImage = "url('" + img.src + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;

    /* Execute a function when someone moves the magnifier glass over the image: */
  /*  glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);
    
    
    /*and also for touch screens:
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);
    */
    $(".pictureColumn > *").on("mousemove", moveMagnifier)
    $(".pictureColumn > *").on("touchmove", moveMagnifier)

    function moveMagnifier(e) { 
        var pos, x, y;
        /* Prevent any other actions that may occur when moving over the image */
        e.preventDefault();
        /* Get the cursor's x and y positions: */
        pos = getCursorPos(e);
        x = pos.x;
        y = pos.y;
        $(glass).show()

        var divider = 2 * zoom;
        /* Prevent the magnifier glass from being positioned outside the image: */
        if (x > img.width - w / divider) { $(glass).hide() }
        if (x < w / divider) { $(glass).hide() }
        if (y > (img.height - h / divider)) { $(glass).hide() }
        if (y < h / divider) { $(glass).hide() }
        /* Set the position of the magnifier glass: */
        glass.style.left = (x - w) + "px";
        glass.style.top = (y - h) + "px";
        /* Display what the magnifier glass "sees": */
        glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
    }

    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /* Get the x and y positions of the image: */
        a = img.getBoundingClientRect();
        /* Calculate the cursor's x and y coordinates, relative to the image: */
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
    }
}

function setMagnification(value) {
    $("#magnificationSelector .selected").removeClass("selected");
    $("#magnifyBtn").html("Magnify " + value + "X");
    $("#magnificationSelector li[data-value='" + value + "']").addClass("selected");
    magnify(value);

}
function showMagnifySelect() {
    $("#magnificationSelector").addClass("showSelector");
    $("#magnificationSelector li").on("click", function () {
        $("#magnificationSelector").removeClass("showSelector");
        var val = $(this).data("value");
        setMagnification(val);
    });

    setTimeout(function () {
        $("body").one("click", function () {
            $("#magnificationSelector").removeClass("showSelector");
        })
    }, 50);

}

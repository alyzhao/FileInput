$(document).ready(function() {

    /* 判断FormData是否为空的函数
     * @return 为空返回true, 否则返回false
     */
    function isEmptyFormData(formData) {
        for (var p of formData.entries()) {
            return false;
        }
        return true;
    }

    /* layer弹出错误提示 
     * @param layerObj ,存储传入参数的对象
     */
    function layerMsg(layerObj) {
        let words = layerObj.words,
            time = layerObj.time || 2000,
            icon = 1;
        switch(layerObj.type)
        {
            case "warning": icon = 0; break;    // 警告的图标 
            case "success": icon = 1; break;    // 提示成功
            case "error": icon = 2; break;      // 提示错误
            case "ask": icon = 3; break;        // 提示询问
            case "lock": icon = 4; break;       // 带锁的图标
            case "unhappy": icon = 5; break;    // 不开心的图标
            case "smile": icon = 6; break;      // 笑脸图标
            // default: icon = 0;
        }
        layer.msg(words, { icon: icon, time: time });
    }


    /* 用formdata上传图片的方法
     * @formdata 要传递的formdata 
     * @param url -- 上传文件后台处理的地址
     * @param directory -- 上传图片的图片目录, 绝对路径
     * @param callback -- 上传成功的处理函数
     */
    function uploadImg(formdata, url, directory, callback) {
        formdata.append("directory", directory);
        $.ajax({
            url: url,
            type: "post",
            data: formdata,
            processData: false,
            contentType: false,
            success: function(data) {
                callback(data);
            }
        });
    }

    /* 多图上传中获取div的ID最大值
     * @param 多图组件的jquery对象
     * @return 如果为没有上传的图片返回0，否则返回最大值
     */
    function maxScrollNum(upfileWrap) {
        var objLastCell = upfileWrap.find(".multiple-cell:last-child");     // 获取最大的ID，用以标记图片,从而返回url
        var maxNum = objLastCell.length > 0 ? /(.*)(\d+)/.exec(objLastCell.attr("id"))[2] : 0;
        return maxNum;
    }

    jQuery.fn.extend({
        /*
         * 多图上传中，显示上传图片的个数
         */
        showFileName: function() {
            var pMultipleCell = this.parents(".fileinput-wrap");
            var imgCount = pMultipleCell.find(".multiple-cell").length;
            var fileContent = imgCount == 0 ? "" : `<i class="fa fa-file"></i>${imgCount} files selected`;
            this.html(fileContent);
        }
    });




    var singleFormData;     // 单图上传的FormData
    var multFormData;       // 多图上传的FormData    

	// 单图上传
	// input的change事件
	$(".input-upload[multiple=nomultiple]").on("change", function() {
		var file = $(this).get(0).files[0];
		var regImg = /image\/(jpg|jpeg|png|gif)/i;
		if (!regImg.test(file.type)) {
			layer.msg("只能上传jpg、jpeg、png、gif格式的图片", { icon: 2, time: 2000 });
			return false;
		}
		var upfileWrap = $(this).parents(".fileinput-wrap");   // 上传元素的父元素
        upfileWrap.removeClass("file-input-new");
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            upfileWrap.find(".file-zone").html("<img src='" + data + "' />");
        }
        reader.readAsDataURL(file);
        // 把单图文件流添加到singleForData中
        singleFormData = new FormData();
        singleFormData.append("singlePic", file);
        upfileWrap.find(".file-captain-name").html("<i class='fa fa-file'></i>" + file.name);
	});

	// remove按钮的点击事件
	$(".file-remove-button").on("click", function() {
        var upfileWrap = $(this).parents(".fileinput-wrap");	// 上传组件的div元素
        upfileWrap.addClass("file-input-new");
        upfileWrap.find(".file-captain-name").html("");
        upfileWrap.find(".file-zone").html("<span class='no-files'>No Files...</span>");
        upfileWrap.find(".input-upload").val("");
        upfileWrap.find(".data-imgurl").html("");

        // 单图的FormData不为空时， 初始化
        if (!isEmptyFormData(singleFormData)) {
            singleFormData = new FormData();
        }

        // 多图上传时
        if(!isEmptyFormData(multFormData)) { 
            multFormData = new FormData();
        }
	});

	// upload按钮上传图片点击
	$(".file-upload-button").on("click", function() {
		var $this = $(this);
		var upfileWrap = $this.parents(".fileinput-wrap");
        if ($this.attr("data-code") == 0) {
            return false;
        }
        $this.attr("data-code", 0); 

        // 单图上传
        if (upfileWrap.find("input[multiple=nomultiple]").length > 0) {
            // 如果singleFormData为空, 那么提示错误信息
            if (isEmptyFormData(singleFormData)) {
                layerMsg({type: "warning", words: "请选择图片！"});
                return false;
            }
            uploadImg(singleFormData, "/Upload/UploadImg/", "/images/singleImgs/", function(data) {
                // 单图上传成功的回调函数
                if (data.error == 0) {
                    upfileWrap.find(".data-imgurl").html(data.imgUrl);
                    layerMsg({type: "success", words: "上传成功！"});
                    singleFormData = new FormData();    // 初始化singleFormData
                } else {
                    layerMsg({type: "error", words: "上传失败！"})
                }
                $this.attr("data-code", 1);
            });
        } else {
            // 多图上传
            if (isEmptyFormData(multFormData)) {
                layerMsg({type: "warning", words: "没有要上传的图片！"});
                return false;
            }
            uploadImg(multFormData, "/Upload/UploadImg/", "/images/multipleImgs/", function(data) {
                // 多图上传回调函数
                if (data.error == 0) {
                    var imgUrlList = data.imgUrlList,
                        length = imgUrlList.length;
                    for (var i = 0; i < length; i++) {
                        var item = imgUrlList[i];
                        $("#" + item.imgName).children(".scrollImgUrl").html(item.imgUrl);
                    }
                    layerMsg({type: "success", words: "上传成功！"});
                    multFormData = new FormData();
                } else {
                    layerMsg({type: "error", words: "上传失败！"});
                }
                $this.attr("data-code", 1);
            })
        }
	});

    // 多图上传中input[type=file]的onchange事件
    $("input-upload[multiple=multiple]").on("change", function() {
        var fileList = $(this).get(0).files;
        var regImg = /image\/(jpg|jpeg|png|gif)/i;
        var upfileWrap = $(this).parents(".upfile-wrap");
        // 去除这个class，表明有图片上传
        upfileWrap.removeClass("file-input-new");
        // 获取当前ID的最大值, 用于编号
        var nowMaxNum = maxScrollNum(upfileWrap);
        var length_file = fileList.length;
        for (var i = 0; i < length_file; i++) {
            var fielItem = fileList[i];
            if (!fielItem.type.match(regImg)) {
                layerMsg({words: "只能上传jpg、jpeg、png、gif格式的图片！", type: "warning"});
                return false;
            }
            // 向multFormData中添加数据
            multFormData.append("multpic" + ++nowMaxNum, fielItem)

            var reader = new FileReader();
            render.onload = function(e) {
                var maxNum = maxScrollNum(upfileWrap);      
                var data = e.target.result;
                var DOMElement = `<div class="multiple-cell" id="multpic${++maxNum}">
                                    <span class="multImgUrl"></span>
                                    <div class="imgwrap">
                                        <img src="${data}" />
                                    </div>
                                    <div class="opera">
                                        <div class="shift">
                                            <button class="btn btn-default scroll-prev"><i class="fa fa-arrow-left"></button>
                                            "<button class="btn btn-default scroll-next"><i class="fa fa-arrow-right"></i></button>"
                                        </div>
                                        <div class="start">
                                            <button class="btn btn-default scroll-remove"><i class="fa fa-trash-o"></i></button>
                                            <button class="btn btn-default scroll-enlarge"><i class="fa fa-search-plus"></i></button>
                                        </div>
                                    </div>
                                </div>`;
                upfileWrap.find(".file-zone").append(DOMElement);
                var imgUrlWrap = upfileWrap.find(".file-captain-name");
                imgUrlWrap.showFileName();
            }
            reader.readAsDataURL(file);
        }
    });

    // 多图上传中向左向右箭头点击
    $(".fileinput-wrap").on("click", ".scroll-prev, .scroll-next", function() {
        $(this).hasClass("scroll-prev") ? $(this).multipleMove("left") : $(this).multipleMove("right");
    });

    // 多图上传中回收图标点击
    $(".fileinput-wrap").on("click", ".multiple-cell .scroll-remove", function() {
        var parentCell = $(this).parents(".multiple-cell"); 
        var objFileName = $(this).parents(".fileinput-wrap").find(".file-captain-name");   // 显示文件名的div
        // 删除formdata中的值
        var keyName = parentCell.attr("id");
        multFormData.delete(keyName);
        parentCell.remove();
        objFileName.showFileName();
    });
    // 放大标志点击
    $(".fileinput-wrap").on("click", ".multiple-cell .scroll-enlarge", function() {
        var imgUrl = $(this).parents(".multiple-cell").find(".imgwrap > img").attr("src");
        $("body").append("<div class='bigger-img-wrap'><div class='img-content'><img src='" + imgUrl + "' /></div></div>");
    });
    $("body").on("click", ".bigger-img-wrap", function(e) {
        if($(e.target).hasClass("bigger-img-wrap")) {
            $(this).remove();
        }
    });

})
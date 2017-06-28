$(document).ready(function() {
	// 单图上传
	// input的change事件
	$(".input-upload[multiple=nomultiple]").on("change", function() {
		var file = $(this).get(0).files[0];
		var regImg = /image\/(jpg|jpeg|png|gif)/i;
		if (!regImg.test(file.type)) {
			layer.msg("只能上传jpg、jpeg、png、gif格式的图片", { icon: 2, time: 2000 });
			return false;
		}
		var upfileWrap = $(this).parents(".upfile-wrap");   // 上传元素的父元素
        upfileWrap.removeClass("file-input-new");
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            upfileWrap.find(".file-zone").html("<img src='" + data + "' />");
        }
        reader.readAsDataURL(file);
        upfileWrap.find(".file-captain-name").html("<i class='fa fa-file'></i>" + file.name);
	})

	// remove按钮的点击事件
	$(".file-remove-button").on("click", function() {
        var upfileWrap = $(this).parents(".upfile-wrap");	// 上传组件的div元素
        upfileWrap.addClass("file-input-new");
        upfileWrap.find(".file-captain-name").html("");
        upfileWrap.find(".file-zone").html("<span class='no-files'>No Files...</span>");
        upfileWrap.find(".input-upload").val("");
        upfileWrap.find(".data-imgurl").html("");

        // 多图上传时
        if(!isEmptyFormData(multFormData)) { 
            multFormData = new FormData();
        }
	});

	// upload按钮上传图片点击
	$(".file-upload-button").on("click", function() {
		var $this = $(this);
		var upfileWrap = $this.parents(".upfile-wrap");
		if (upfileWrap.hasClass("multiple-up")) {
            return false;
        }
        



	});

    /* 用ajaxfileupload上传图片的方法 
     * @param url 文件上传的后台地址
     * @param callback 上传成功后的回掉函数
     * @param elementID 上传文件的input的ID
     * @upType 用于选择后台上传文件夹 0 -- 分类图片上传，1 -- 案例图片上传
     */
    function uploadImg(url, callback, elementID, upType) {
        $.ajaxFileUpload({
            url: url,
            type: "post",
            data: { upType: upType },
            secureuri: false,
            fileElementId: elementID,
            dataType: "json",
            success: function (data, status) {
                callback(data, status);
            }
        });
    }




})
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace UploadImgMVC.Controllers
{
    public class UploadImgController : Controller
    {
        //
        // GET: /UploadImg/

        public ActionResult Index()
        {
            return View();
        }

        public class ImgUrl
        {
            public ImgUrl(string imgName, string imgUrl)
            {
                this.imgName = imgName;     // 用于多图上传中标记，存储url的DOM元素的ID
                this.imgUrl = imgUrl;       // 图片地址
            }
            public string imgName { get; set; }
            public string imgUrl { get; set; }
        }

        public JsonResult UploadImg()
        {
            string imgPath = Request.Form["directory"].Trim();      // 传递的绝对路径
            string imgPrefix = Request.Form["imgPrefix"].Trim();    // 传递的图片前缀
            HttpFileCollection files = System.Web.HttpContext.Current.Request.Files;

            string error = "1";

            List<ImgUrl> imgUrlList = new List<ImgUrl>();

            string physicalPath = Server.MapPath(imgPath);                  // 文件夹的物理目录
            // 如果不存在目录返回错误信息
            if (!System.IO.Directory.Exists(physicalPath))
            {
                return Json(new { error = "不存在该目录！" }, JsonRequestBehavior.AllowGet);
            }
            for (int i = 0, fileLength = files.Count; i < fileLength; i++) {
                // HttpFileCollection 的属性 AllKeys 获取一个字符串数组，包含的文件集合中的所有成员的键
                var imgName = files.AllKeys[i];
                var fileExtension = System.IO.Path.GetExtension(files[i].FileName).ToLower();   // 获取扩展名
                string fileTime = DateTime.Now.ToFileTime().ToString();
                string newFileName = imgPrefix + fileTime + fileExtension;      // 新的文件名
                // 存储文件
                files[i].SaveAs(physicalPath + newFileName);
                ImgUrl imgUrlItem = new ImgUrl(imgName, imgPath + newFileName);
                imgUrlList.Add(imgUrlItem);
                error = "0";
            }

            return Json(new { error = error, imgUrlList = imgUrlList }, JsonRequestBehavior.AllowGet);
        }
    }
}

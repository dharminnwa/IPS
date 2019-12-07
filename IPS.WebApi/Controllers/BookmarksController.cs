using IPS.Business;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class BookmarksController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        IBookmarksService _bookmarkService;

        public BookmarksController(IBookmarksService bookmarkService)
        {
            _bookmarkService = bookmarkService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Bookmark> GetBookmarks()
        {
            return _bookmarkService.GetBookmarks();
        }

     
        [EnableQuery]
        public SingleResult<Bookmark> GetBookmarksById(int id)
        {
            SingleResult<Bookmark> result = SingleResult.Create(_bookmarkService.GetBookmarkById(id));
       
            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(Bookmark bookmark)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            Bookmark result = _bookmarkService.Add(bookmark);

            return Ok(bookmark.Id);

        }

       
        [HttpPut]
        public IHttpActionResult Update(Bookmark bookmark)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Bookmark obj = _bookmarkService.GetBookmarkById(bookmark.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                _bookmarkService.Update(bookmark);

                return Ok(HttpStatusCode.OK);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                Bookmark bookmark = _bookmarkService.GetBookmarkById(id).FirstOrDefault();
                if (bookmark == null)
                {
                    return NotFound();
                }

                _bookmarkService.Delete(bookmark);

                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Bookmark was not deleted due to server error");
            }
        }

    }
}

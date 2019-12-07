using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class BookmarksService : BaseService, IPS.Business.IBookmarksService
    {
        public IQueryable<Bookmark> GetBookmarks()
        {
            var currentUser = _authService.getCurrentUser();
            //int userId = int.Parse(currentUser.Id);
            User user = _ipsDataContext.Users.Where(u => u.UserKey == currentUser.Id).FirstOrDefault();
            return _ipsDataContext.Bookmarks.Where(b => b.UserId == user.Id).AsNoTracking().AsQueryable();
            //return _ipsDataContext.Bookmarks.AsQueryable();
        }

        public IQueryable<Bookmark> GetBookmarkById(int id)
        {
            return _ipsDataContext.Bookmarks.Where(b => b.Id == id).AsQueryable();
        }

        public Bookmark Add(Bookmark bookmark)
        {
            bookmark.User = null;
        
            _ipsDataContext.Bookmarks.Add(bookmark);
            _ipsDataContext.SaveChanges();
            return bookmark;
        }

        public void Update(Bookmark bookmark)
        {
            var original = _ipsDataContext.Bookmarks.Find(bookmark.Id);

            if (original != null)
            {
                bookmark.User = null;
             
                _ipsDataContext.Entry(original).CurrentValues.SetValues(bookmark);

                _ipsDataContext.SaveChanges();
            }

            
        }

        public void Delete(Bookmark bookmark)
        {
            _ipsDataContext.Bookmarks.Remove(bookmark);
            _ipsDataContext.SaveChanges();

            
        }
    }
}

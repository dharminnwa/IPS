using IPS.Data;
using System;
using System.Linq;
namespace IPS.Business
{
    public interface IBookmarksService
    {
        System.Linq.IQueryable<IPS.Data.Bookmark> GetBookmarks();
        IQueryable<Bookmark> GetBookmarkById(int id);
        Bookmark Add(IPS.Data.Bookmark bookmark);
        void Update(IPS.Data.Bookmark bookmark);
        void Delete(IPS.Data.Bookmark bookmark);
    }
}

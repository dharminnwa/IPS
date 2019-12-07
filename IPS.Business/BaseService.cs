using IPS.Data;
using IPS.Fx.Utilities.Cultures;
using System;
using System.Linq;
using System.Threading;

namespace IPS.Business
{

    public class BaseService : IDisposable
    {
        public IPSData _ipsDataContext = null;
        protected AuthService _authService;

        public BaseService()
        {
            _ipsDataContext = DataContextFactory.GetIPSContext();
            _authService = new AuthService();
        }

        protected void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_ipsDataContext != null)
                {
                    _ipsDataContext.Dispose();
                    _ipsDataContext = null;
                }
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected string NewAvailableName(string currentName)
        {

            var splittedName = currentName.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            var currentIndexStr = splittedName.Last();
            var index = 1;
            var countSegmentsForName = splittedName.Length;

            if (!string.IsNullOrEmpty(currentIndexStr))
            {
                int currentIndex;
                if (int.TryParse(currentIndexStr, out currentIndex))
                {
                    index = currentIndex + 1;
                    countSegmentsForName--;
                }
            }

            var nameSegments = splittedName.Take(countSegmentsForName).ToList();
            if (currentName.ToLower().IndexOf("start") > -1)
            {
                nameSegments = splittedName.Take(1).ToList();
                nameSegments[0] = "Retest";
                nameSegments.Add(index.ToString());
            }
            else
            {
                nameSegments = splittedName.Take(countSegmentsForName).ToList();
                nameSegments.Add(index.ToString());
            }

            return string.Join(" ", nameSegments);
        }

        protected void UpdateLazyLoading(bool enabled)
        {
            _ipsDataContext.Configuration.LazyLoadingEnabled = enabled;
        }

        protected void SaveChanges(bool asynchronously = false)
        {
            if (asynchronously)
            {
                _ipsDataContext.SaveChangesAsync();
            }
            else
            {
                _ipsDataContext.SaveChanges();
            }
        }

        public string GetCurrentCulture()
        {
            return Thread.CurrentThread.CurrentUICulture.Name;
        }

        protected string GetLocalizedText(string key)
        {
            return CultureTextFactory.GetTexts(GetCurrentCulture(), key);
        }
    }
}
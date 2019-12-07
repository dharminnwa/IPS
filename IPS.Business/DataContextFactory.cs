using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public sealed class DataContextFactory
    {
        public static IPSData GetIPSContext()
        {
            var connection = new IPSData();
            connection.Configuration.LazyLoadingEnabled = false;
            return connection;
        }
    }
}

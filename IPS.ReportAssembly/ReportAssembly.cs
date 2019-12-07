using IPS.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

using System.Globalization;
using System.IO;
using System.Collections;

namespace IPS.ReportAssembly
{
    public static class ReportAssembly
    {
        public static string GetCultureValueForReport(string name, string culture)
        {

            string resourceValue = string.Empty;
            try
            {
                if (culture.ToLower() == "nb-no")
                {
                    ResourceManager rm = new ResourceManager("IPS.ReportAssembly.cultures.nb-NO", Assembly.GetExecutingAssembly());
                    resourceValue = rm.GetString(name);
                }
                else
                {
                    ResourceManager rm = new ResourceManager("IPS.ReportAssembly.cultures.en-US", Assembly.GetExecutingAssembly());
                    resourceValue = rm.GetString(name);
                }
            }
            catch (Exception ex)
            {
                resourceValue = string.Empty;
            }
            return resourceValue;
        }
    }
}
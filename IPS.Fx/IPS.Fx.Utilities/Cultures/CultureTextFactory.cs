using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Fx.Utilities.Cultures
{
    public static class CultureTextFactory
    {
        public static string GetTexts(string cultureCode, string key)
        {
            Type culture = Type.GetType("IPS.Fx.Utilities.Cultures." + cultureCode.Replace("-", string.Empty) + ", IPS.Fx.Utilities, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null");
            return culture.GetField(key, BindingFlags.Static | BindingFlags.Public).GetValue(null).ToString();
        }
    }
}

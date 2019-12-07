using IPS.Data;

namespace IPS.Business.Extensions
{
    public static class DocumentExtensions
    {
        public static string GetName(this Document document)
        {
            return $"{document.Id}{document.Extension}";
        }
    }
}
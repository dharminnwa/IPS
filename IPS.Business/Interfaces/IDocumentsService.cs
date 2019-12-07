using System;
using IPS.Data;

namespace IPS.Business.Interfaces
{
    public interface IDocumentsService
    {
        Document Get(Guid id);
        Document Save(string fileName, string resourceType, Guid? id = null);
    }
}
using System;
using System.IO;
using System.Linq;
using IPS.Business.Interfaces;
using IPS.Data;

namespace IPS.Business
{
    public class DocumentsService : BaseService, IDocumentsService
    {
        public Document Get(Guid id)
        {
            return _ipsDataContext.Documents.FirstOrDefault(x=>x.Id == id);
        }

        public Document Save(string fileName, string resourceType, Guid? id = null)
        {
            if (!id.HasValue)
            {
                id = Guid.NewGuid();
            }
            var document = new Document
            {
                Id = id.Value,
                Title = fileName,
                Extension = Path.GetExtension(fileName),
                ResourceType = resourceType
            };
            _ipsDataContext.Documents.Add(document);
            _ipsDataContext.SaveChanges();
            return document;
        }
    }
}
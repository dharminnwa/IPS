using System;
using IPS.Data;
using System.Collections.Generic;

namespace IPS.Business
{
    public interface IProfileTagService
    {
        Tag Add(Tag profileTag);
        bool Delete(Tag profileTag);
        List<Tag> Get();
        Tag GetById(int id);
        bool Update(Tag profileTag);
    }
}

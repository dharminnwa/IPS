using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Stores
{
    internal class EntityStore<TEntity>
    where TEntity : class
    {
        public DbContext Context { get; private set; }
        public DbSet<TEntity> DbEntitySet { get; private set; }
        public IQueryable<TEntity> EntitySet
        {
            get
            {
                return this.DbEntitySet;
            }
        }
        public EntityStore(DbContext context)
        {
            this.Context = context;
            this.DbEntitySet = context.Set<TEntity>();
        }
        public void Create(TEntity entity)
        {
            this.DbEntitySet.Add(entity);
        }
        public void Delete(TEntity entity)
        {
            this.DbEntitySet.Remove(entity);
        }
        public virtual Task<TEntity> GetByIdAsync(object id)
        {
            return this.DbEntitySet.FindAsync(new object[] { id });
        }
        public virtual void Update(TEntity entity)
        {
            if (entity != null)
            {
                this.Context.Entry<TEntity>(entity).State = EntityState.Modified;
            }
        }
    }
}
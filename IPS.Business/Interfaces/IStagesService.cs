using IPS.Data;
using System.Linq;
using IPS.BusinessModels.Entities;

namespace IPS.Business
{
    public interface IStagesService
    {
        Stage Add(Stage stage);
        string Delete(Stage stage);
        IQueryable<Stage> Get();
        IQueryable<Stage> GetById(int id);
        bool Update(Stage stage);
        int SaveStageEvolution(IpsKTFinalKPI data);
        int? GetLastStageEvolutionId(int stageId, int participantId);
    }
}

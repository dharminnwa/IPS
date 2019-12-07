using System.Web;

namespace IPS.WebApi.FlowJs.Interface
{
    public interface IFlowJsRepo
    {
        FlowJsPostChunkResponse PostChunk(HttpRequest request, string folder);
        FlowJsPostChunkResponse PostChunk(HttpRequest request, string folder, FlowValidationRules validationRules);
        bool ChunkExists(string folder, HttpRequest request);
    }
}

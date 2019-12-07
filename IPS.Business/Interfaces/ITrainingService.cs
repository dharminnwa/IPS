using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.TrainingModels;

namespace IPS.Business
{
    public interface ITrainingService
    {
        Training Add(Training training);
        string Delete(IpsTrainingModel training);
        string DeletePerformanceGroupTraining(IpsTrainingModel training);
        List<IpsTrainingModel> Get();
        //IQueryable<Training> GetById(int trainingId);
        bool Update(Training training);
        Training CloneTraining(int trainingId);
        void CheckTrainingInUse(int trainingId);
        void CheckPerformanceGroupTrainingInUse(int trainingId);
        bool IsTrainingExist(int trainingId);
        TrainingFeedback AddTrainingFeedback(TrainingFeedback trainingFeedback);
        TrainingNote SaveTrainingNote(TrainingNote trainingNote);
        List<IPSTrainingFeedback> getTrainingFeedbacks(int trainingId);
        IPSTrainingFeedback getTrainingFeedbackById(int trainingFeedbackId);
        List<IpsTrainingModel> FilterTraining(IpsTrainingFilter ipsTrainingFilter);
        List<IpsTrainingModel> FilterSkillTraining(IpsTrainingFilter ipsTrainingFilter);
        List<IpsTrainingModel> GetProjectTrainings(int projectId);
        List<IpsTrainingModel> getTrainingTemplatesBySkill(int skillId);
        IpsTrainingModel GetTrainingDetailById(int trainingId);
        void UpdateTrainingFrequencyDecription();

        bool AddSensorData(List<SensorData> sensorDatas);

        List<SensorData> GetSensorDataByUserId(int userId);
        bool DeleteSensorDataById(int id);

        List<IpsTrainingModel> GetTemplates();
    }
}

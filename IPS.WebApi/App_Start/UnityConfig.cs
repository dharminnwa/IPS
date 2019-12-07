using IPS.Business;
using IPS.Business.Interfaces;
using IPS.WebApi.Utils;
using Microsoft.Practices.Unity;
using System.Web.Http;
using Unity.WebApi;

namespace IPS.WebApi
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = new UnityContainer();

            // register all your components with the container here
            // it is NOT necessary to register your controllers

            // e.g. container.RegisterType<ITestService, TestService>();


            container.RegisterType<IAuthService, AuthService>();
            container.RegisterType<IIndustryService, IndustryService>(new PerRequestLifetimeManager());
            container.RegisterType<IOrganizationService, OrganizationService>(new PerRequestLifetimeManager());
            container.RegisterType<IDepartmentService, DepartmentService>(new PerRequestLifetimeManager());
            container.RegisterType<ITeamService, TeamService>(new PerRequestLifetimeManager());
            container.RegisterType<ICountryService, CountryService>(new PerRequestLifetimeManager());
            container.RegisterType<ICultureService, CultureService>(new PerRequestLifetimeManager());
            container.RegisterType<IUserService, UserService>(new PerRequestLifetimeManager());
            container.RegisterType<IUserTypeService, UserTypeService>(new PerRequestLifetimeManager());
            container.RegisterType<IProfileTypeService, ProfileTypeService>(new PerRequestLifetimeManager());
            container.RegisterType<IProfileService, ProfileService>(new PerRequestLifetimeManager());
            container.RegisterType<IProfileCategoryService, ProfileCategoryService>(new PerRequestLifetimeManager());
            container.RegisterType<IProfileTagService, ProfileTagService>(new PerRequestLifetimeManager());
            container.RegisterType<IProfileScaleSettingsRuleService, ProfileScaleSettingsRuleService>(new PerRequestLifetimeManager());
            container.RegisterType<IScaleCategoryService, ScaleCategoryService>(new PerRequestLifetimeManager());
            container.RegisterType<IScaleRangeService, ScaleRangeService>(new PerRequestLifetimeManager());
            container.RegisterType<IScaleService, ScaleService>(new PerRequestLifetimeManager());
            container.RegisterType<IMeasureUnitService, MeasureUnitService>(new PerRequestLifetimeManager());
            container.RegisterType<IKTMedalRuleService, KTMedalRuleService>(new PerRequestLifetimeManager());
            container.RegisterType<IStructureLevelService, StructureLevelService>(new PerRequestLifetimeManager());
            container.RegisterType<ISurveyService, SurveyService>(new PerRequestLifetimeManager());
            container.RegisterType<IDurationMetricsService, DurationMetricsService>(new PerRequestLifetimeManager());
            container.RegisterType<IExerciseMetricsService, ExerciseMetricsService>(new PerRequestLifetimeManager());
            container.RegisterType<ITrainingService, TrainingService>(new PerRequestLifetimeManager());
            container.RegisterType<ITrainingLevelService, TrainingLevelService>(new PerRequestLifetimeManager());
            container.RegisterType<ITrainingTypeService, TrainingTypeService>(new PerRequestLifetimeManager());
            container.RegisterType<ITrainingDescriptionService, TrainingDescriptionService>(new PerRequestLifetimeManager());
            container.RegisterType<IPerformanceGroupService, PerformanceGroupsService>(new PerRequestLifetimeManager());
            container.RegisterType<IStagesService, StagesService>(new PerRequestLifetimeManager());
            container.RegisterType<IStageGroupsService, StageGroupsService>(new PerRequestLifetimeManager());
            container.RegisterType<IJobPositionService, JobPositionService>(new PerRequestLifetimeManager());
            container.RegisterType<ILookupItemsService, LookupItemsService>(new PerRequestLifetimeManager());
            container.RegisterType<IEvaluationRolesService, EvaluationRolesService>(new PerRequestLifetimeManager());
            container.RegisterType<IAnswersService, AnswersService>(new PerRequestLifetimeManager());
            container.RegisterType<IAnswerTypesService, AnswerTypesService>(new PerRequestLifetimeManager());
            container.RegisterType<INotificationTemplatesService, NotificationTemplatesService>(new PerRequestLifetimeManager());
            container.RegisterType<IQuestionsService, QuestionsService>(new PerRequestLifetimeManager());
            container.RegisterType<IScorecardPerspectiveService, ScorecardPerspectiveService>(new PerRequestLifetimeManager());
            container.RegisterType<IScorecardGoalsService, ScorecardGoalsService>(new PerRequestLifetimeManager());
            container.RegisterType<ISkillsService, SkillsService>(new PerRequestLifetimeManager());
            container.RegisterType<IRolePermitionsService, RolePermitionsService>(new PerRequestLifetimeManager());
            container.RegisterType<IRoleService, RoleService>(new PerRequestLifetimeManager());
            container.RegisterType<IIpsUserService, IpsUserService>(new PerRequestLifetimeManager());
            container.RegisterType<IPerformanceService, PerformanceService>(new PerRequestLifetimeManager());
            container.RegisterType<IReminderService, ReminderService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskService, TaskService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskStatusService, TaskStatusService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskPriorityListsService, TaskPriorityListsService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskPriorityListItemsService, TaskPriorityListItemsService>(new PerRequestLifetimeManager());
            container.RegisterType<IEvaluationParticipantsService, EvaluationParticipantsService>(new PerRequestLifetimeManager());
            container.RegisterType<IEvaluationAgreementsService, EvaluationAgreementsService>(new PerRequestLifetimeManager());
            container.RegisterType<INotificationService, NotificationService>(new PerRequestLifetimeManager());
            container.RegisterType<IEvaluationStatusService, EvaluationService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskPriorityListsService, TaskPriorityListsService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskPriorityListItemsService, TaskPriorityListItemsService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskCategoryListsService, TaskCategoryListsService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskCategoryListItemsService, TaskCategoryListItemsService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskStatusListsService, TaskStatusListsService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskStatusListItemsService, TaskStatusListItemsService>(new PerRequestLifetimeManager());
            container.RegisterType<IBookmarksService, BookmarksService>(new PerRequestLifetimeManager());
            container.RegisterType<IProjectService, ProjectService>(new PerRequestLifetimeManager());
            container.RegisterType<IIpsEmailService, IpsEmailService>(new PerRequestLifetimeManager());
            container.RegisterType<IIpsAttachmentService, IpsAttachmentService>(new PerRequestLifetimeManager());
            container.RegisterType<IProjectRolesService, ProjectRolesService>(new PerRequestLifetimeManager());
            container.RegisterType<INotificationIntervalService, NotificationIntervalService>(new PerRequestLifetimeManager());
            container.RegisterType<IManageCmsContentService, ManageCmsContentService>(new PerRequestLifetimeManager());
            container.RegisterType<IManageHelpContentService, ManageHelpContentService>(new PerRequestLifetimeManager());
            container.RegisterType<IManagePlanService, ManagePlanService>(new PerRequestLifetimeManager());
            container.RegisterType<IDocumentsService, DocumentsService>(new PerRequestLifetimeManager());

            container.RegisterType<ITestimonialService, TestimonialService>(new PerRequestLifetimeManager());
            container.RegisterType<IContactUsService, ContactUsService>(new PerRequestLifetimeManager());
            container.RegisterType<IManageTemplatepContentService, ManageTemplateContentService>(new PerRequestLifetimeManager());

            container.RegisterType<IPortfolioService, PortfolioService>(new PerRequestLifetimeManager());
            container.RegisterType<ITaskScaleService, TaskScaleService>(new PerRequestLifetimeManager());
            container.RegisterType<ITrainingDiaryService, TrainingDiaryService>(new PerRequestLifetimeManager());

            container.RegisterType<IResourceService, ResourceService>(new PerRequestLifetimeManager());
            container.RegisterType<IRoleLevelService, RoleLevelService>(new PerRequestLifetimeManager());
            container.RegisterType<IRoleLevelPermissionTemplateService, RoleLevelPermissionTemplateService>(new PerRequestLifetimeManager());
            container.RegisterType<IRoleLevelPermissionService, RoleLevelPermissionService>(new PerRequestLifetimeManager());

            container.RegisterType<ICustomerService, CustomerService>(new PerRequestLifetimeManager());
            container.RegisterType<IDailyEvaluationService, DailyEvaluationService>(new PerRequestLifetimeManager());
            GlobalConfiguration.Configuration.DependencyResolver = new UnityDependencyResolver(container);
        }
    }
}

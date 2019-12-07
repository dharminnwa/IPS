CREATE TABLE [dbo].[Tasks] (
    [Id]                             INT            IDENTITY (1, 1) NOT NULL,
    [Title]                          NVARCHAR (150) NOT NULL,
    [Description]                    NVARCHAR (MAX) NULL,
    [TaskListId]                     INT            NOT NULL,
    [IsCompleted]                    BIT            CONSTRAINT [DF_Tasks_IsCompleted] DEFAULT ((0)) NOT NULL,
    [CompletedDate]                  DATETIME       NULL,
    [CreatedById]                    INT            NULL,
    [CreatedByName]                  NVARCHAR (50)  NULL,
    [CreatedDate]                    DATETIME       NULL,
    [DueDate]                        DATETIME       NULL,
    [ParentTaskID]                   INT            NULL,
    [StartDate]                      DATETIME       NULL,
    [StatusId]                       INT            NULL,
    [PriorityId]                     INT            NULL,
    [TimeEstimateMinutes]            INT            NULL,
    [TimeSpentMinutes]               INT            NULL,
    [AssignedToId]                   INT            NULL,
    [CategoryId]                     INT            NULL,
    [RecurrenceRule]                 NVARCHAR (MAX) NULL,
    [TrainingId]                     INT            NULL,
    [NotificationTemplateId]         INT            NULL,
    [IsSMSNotification]              BIT            CONSTRAINT [DF_Tasks_IsSMSNotification] DEFAULT ((0)) NOT NULL,
    [IsEmailNotification]            BIT            CONSTRAINT [DF_Tasks_IsEmailNotification] DEFAULT ((0)) NOT NULL,
    [ProfileId]                      INT            NULL,
    [StageId]                        INT            NULL,
    [EmailBefore]                    INT            NULL,
    [SmsBefore]                      INT            NULL,
    [ProjectId]                      INT            NULL,
    [MeetingNotificationTemplateId]  INT            NULL,
    [FollowUpNotificationTemplateId] INT            NULL,
    [SalesNotificationTemplateId]    INT            NULL,
    CONSTRAINT [PK_Tasks] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Tasks_NotificationTemplates] FOREIGN KEY ([NotificationTemplateId]) REFERENCES [dbo].[NotificationTemplates] ([Id]),
    CONSTRAINT [FK_Tasks_Profiles] FOREIGN KEY ([ProfileId]) REFERENCES [dbo].[Profiles] ([Id]),
    CONSTRAINT [FK_Tasks_Stages] FOREIGN KEY ([StageId]) REFERENCES [dbo].[Stages] ([Id]),
    CONSTRAINT [FK_Tasks_TaskCategoryListItems] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[TaskCategoryListItems] ([Id]),
    CONSTRAINT [FK_Tasks_TaskLists] FOREIGN KEY ([TaskListId]) REFERENCES [dbo].[TaskLists] ([Id]),
    CONSTRAINT [FK_Tasks_TaskPriorityListItems] FOREIGN KEY ([PriorityId]) REFERENCES [dbo].[TaskPriorityListItems] ([Id]),
    CONSTRAINT [FK_Tasks_Tasks] FOREIGN KEY ([ParentTaskID]) REFERENCES [dbo].[Tasks] ([Id]),
    CONSTRAINT [FK_Tasks_TaskStatusListItems] FOREIGN KEY ([StatusId]) REFERENCES [dbo].[TaskStatusListItems] ([Id]),
    CONSTRAINT [FK_Tasks_Trainings] FOREIGN KEY ([TrainingId]) REFERENCES [dbo].[Trainings] ([Id])
);


















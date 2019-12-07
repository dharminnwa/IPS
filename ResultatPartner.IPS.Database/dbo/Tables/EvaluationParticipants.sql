CREATE TABLE [dbo].[EvaluationParticipants] (
    [StageGroupId]     INT      NOT NULL,
    [UserId]           INT      NOT NULL,
    [IsLocked]         BIT      NOT NULL,
    [EvaluationRoleId] INT      NOT NULL,
    [Id]               INT      IDENTITY (1, 1) NOT NULL,
    [EvaluateeId]      INT      NULL,
    [IsSelfEvaluation] BIT      NULL,
    [Invited]          DATETIME NULL,
    [IsScoreManager]   BIT      CONSTRAINT [DF_EvaluationParticipants_IsScoreManager] DEFAULT ((0)) NOT NULL,
    [ResultSendOutAt]  DATETIME NULL,
    [IsResultSendOut]  BIT      CONSTRAINT [DF_EvaluationParticipants_IsResultSendoUt] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_EvaluationParticipants] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_EvaluationParticipants_EvaluateeId_Id] FOREIGN KEY ([EvaluateeId]) REFERENCES [dbo].[EvaluationParticipants] ([Id]),
    CONSTRAINT [FK_EvaluationParticipants_EvaluationRoles] FOREIGN KEY ([EvaluationRoleId]) REFERENCES [dbo].[EvaluationRoles] ([Id]),
    CONSTRAINT [FK_EvaluationParticipants_StageGroups] FOREIGN KEY ([StageGroupId]) REFERENCES [dbo].[StageGroups] ([Id])
);




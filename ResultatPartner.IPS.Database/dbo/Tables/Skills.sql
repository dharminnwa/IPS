CREATE TABLE [dbo].[Skills] (
    [Id]               INT             IDENTITY (1, 1) NOT NULL,
    [Name]             NVARCHAR (250)  NOT NULL,
    [Description]      NVARCHAR (1000) NULL,
    [ParentId]         INT             NULL,
    [OrganizationId]   INT             NULL,
    [IsTemplate]       BIT             CONSTRAINT [DF_Skills_IsTemplate] DEFAULT ((0)) NOT NULL,
    [StructureLevelId] INT             NULL,
    [IsActive]         BIT             NULL,
    [ProfileTypeId]    INT             NULL,
    [CreatedBy]        INT             NULL,
    [CreatedOn]        DATETIME        NULL,
    [ModifiedBy]       INT             NULL,
    [ModifiedOn]       DATETIME        NULL,
    [CreatedAsRoleId]  NVARCHAR (128)  NULL,
    [ModifiedAsRoleId] NVARCHAR (128)  NULL,
    [SeqNo]            INT             NULL,
    CONSTRAINT [PK_Skills] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Skills_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Skills_ProfileTypes] FOREIGN KEY ([ProfileTypeId]) REFERENCES [dbo].[ProfileTypes] ([Id]),
    CONSTRAINT [FK_Skills_Skills] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Skills] ([Id]),
    CONSTRAINT [FK_Skills_StructureLevels] FOREIGN KEY ([StructureLevelId]) REFERENCES [dbo].[StructureLevels] ([Id])
);






CREATE TABLE [dbo].[TemplateCategory] (
    [TemplateCategoryID] INT            IDENTITY (1, 1) NOT NULL,
    [TemplateTypeID]     INT            NULL,
    [Title]              VARCHAR (1000) NULL,
    [Meta]               VARCHAR (1000) NULL,
    [Icon]               VARCHAR (1000) NULL,
    [KeyWord]            VARCHAR (1000) NULL,
    [Description]        VARCHAR (MAX)  NULL,
    [LanguageID]         INT            CONSTRAINT [DF_TemplateCategory_LanguageID] DEFAULT ((1)) NULL,
    [IsParentCategory]   BIT            CONSTRAINT [DF_TemplateCategory_IsParentCategory] DEFAULT ((0)) NULL,
    [ParentCategoryID]   INT            NULL,
    [IsDeleted]          BIT            CONSTRAINT [DF_TemplateCategory_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_TemplateCategory] PRIMARY KEY CLUSTERED ([TemplateCategoryID] ASC),
    CONSTRAINT [FK_TemplateCategory_TemplateCategory] FOREIGN KEY ([ParentCategoryID]) REFERENCES [dbo].[TemplateCategory] ([TemplateCategoryID])
);




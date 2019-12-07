CREATE TABLE [dbo].[PortfolioCategory] (
    [PortfolioCategoryID] INT            IDENTITY (1, 1) NOT NULL,
    [Title]               VARCHAR (1000) NULL,
    [Description]         VARCHAR (MAX)  NULL,
    [LanguageID]          INT            CONSTRAINT [DF_PortfolioCategory_LanguageID] DEFAULT ((1)) NULL,
    [IsDeleted]           BIT            CONSTRAINT [DF_PortfolioCategory_IsDeleted] DEFAULT ((0)) NULL,
    [Image]               VARCHAR (50)   NULL,
    CONSTRAINT [PK_PortfolioCategory] PRIMARY KEY CLUSTERED ([PortfolioCategoryID] ASC)
);




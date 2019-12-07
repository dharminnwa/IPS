CREATE TABLE [dbo].[PortfolioImages] (
    [ProtfolioProjectImageID] INT            IDENTITY (1, 1) NOT NULL,
    [ImagePath]               VARCHAR (1000) NULL,
    [DisplayOnTop]            BIT            CONSTRAINT [DF_PortfolioImages_DisplayOnTop] DEFAULT ((0)) NULL,
    [PortfolioProjectID]      INT            NULL,
    [IsDeleted]               BIT            CONSTRAINT [DF_PortfolioImages_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_PortfolioImages] PRIMARY KEY CLUSTERED ([ProtfolioProjectImageID] ASC),
    CONSTRAINT [FK_PortfolioImages_PortfolioProjects] FOREIGN KEY ([PortfolioProjectID]) REFERENCES [dbo].[PortfolioProjects] ([PortfolioProjectID])
);




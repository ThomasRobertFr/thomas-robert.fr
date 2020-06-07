---
title: "LogAnalysis: Open-Source Web Tool For Geographic Business Intelligence"
lang-ref: loganalysis-open-source-web-tool-for-geographic-business-intelligence
redirect_from: /en/loganalysis-open-source-web-tool-for-geographic-business-intelligence/
---

<p class="text-center">
<img src="{{ '/data/blog/loganalysis_prev.png' | prepend: base_url }}">
</p>

# Context

I studied ASI (Architecture of Information Systems) at the INSA of Rouen, and during the second semester of the 4th year and the first semester of the 5th year, students work on a big R&D-like industrial project (PIC, for INSA Certified Project) for a company, carried out by teams of students.

5 projects are realized by 6 teams of 7 to 9 students during 1 scholar year, at a pace of 25 to 28 hours per week. One of those team work as a subcontractor for another team, and this team only exist during the first half of the project.

# Subject

The subject my team worked on was to make an Open Source web tool allowing each and every one to be able to do Geographical Business Intelligence (GeoBI) as easily as possible, without prior knowledge of the “theory” of GeoBI.

This subject was proposed by our client, the Public Research Center Henri Tudor, based in Luxembourg, now called Luxembourg Institute for Science and Technology (LIST). The subcontractor team worked with mine on this subject.

# Geographical Business Intelligence

To summarize quickly, Business Intelligence (BI) allows you to analyze big quantities of data, usually structured around lots of dimensions. For example revenue as a function of time, geography, clients, business sector, products, etc.

Business Intelligence allows you to analyze these masses of data, allowing you to make up your decisions based on those.

We can split Business Intelligence into 3 big steps:

1.  Collection of data to constitute a structured database
2.  Selection and processing of data
3.  Visualization of the results of the data processing

## Collection of data

This preliminary step of Business Intelligence was not part of the project and is specific to each Information System. The goal is to collect data coming from multiple sources in order to constitute the most accurate and complete database possible. These data are stored in [data warehouses](http://en.wikipedia.org/wiki/Data_warehouse) and [data marts](http://en.wikipedia.org/wiki/Data_mart). They will constitute [OLAP](http://en.wikipedia.org/wiki/Online_analytical_processing) databases.

[![Data warehouse overview – Credits: Wikimedia](/data/blog/loganalysis_dw.jpg)](/data/blog/loganalysis_dw.jpg)

## Selection and processing of data

The first step of any BI analysis is to select which part of the data is interesting regarding the study you want to do (e.g.: select data for France in 2014 only). This is an OLAP _slice_.

Then, the most common data processing is to aggregate the data to get the most relevant results (e.g.: aggregate by month and department). This is an OLAP _dice_.

This is – in a very simplistic way of course – the principle of OLAP: limit the range of data studied and aggregate those at the most relevant level.

[![Slice & Dice - Credits: Thomas Robert](/data/blog/loganalysis_slice_and_dice_en.png)](/data/blog/loganalysis_slice_and_dice_en.png)

## Visualization of the results

The second step of a BI analysis is to render the data for the user. The easiest display is of course the table. However, it is not the most practical way to interpret the data. We therefore use graphics, choropleth map, etc.

[![BI analysis results – Credits: http://apandre.wordpress.com/](/data/blog/loganalysis_bi.png)](/data/blog/loganalysis_bi.png)

# Goals of the project & demonstration

The project is developed as an Open Source web interface that integrates into the already existing web app [GeoNode](http://geonode.org/), it is available on [GitHub](https://github.com/ThomasRobertFr/analytics). The main goals of the project were to:

*   Load and process data using the OLAP database [GeoMondrian](http://www.spatialytics.org/fr/projets/geomondrian/)
*   **Display results on various charts:** choropleth map, pie chart, bar chart, bubble chart, table, word cloud
*   **Allow interaction on the charts** to let the user query the OLAP database and do BI analyses:
    *   Filtering (OLAP _slice_) by clicking
    *   Dimensional zooming (OLAP _drill-down_ and _roll-up_ allowing to change both _slice_ and _dice_) by mouse scroll. For example, a _drill-down_ on France will display data for regions of France. Different variations of drill-down are available: simple (on 1 element), multiple (on more than 1 element), partial (drill-down while keeping elements of the upper level to compare data of various levels)

Here is a quick demo of the final project that will help you visualize these goals more easily:

# Architecture

## General overview

On the following diagram, you can see the architecture of the solution developed:

[![Architecture of LogAnalysis](/data/blog/loganalysis_architecture_loganalysis.png)](/data/blog/loganalysis_architecture_loganalysis.png)

You can see the 4 main components:

*   The **web interface**, which role is to **data visualization**. It is composed of the packages:
    *   _[analytics.js](https://github.com/ThomasRobertFr/analytics-js)_, a package developed that handles all the interface
    *   _QueryAPI_, a proxy of the interfaces of Mandoline, the SOLAP API
    *   _[crossfilter](http://square.github.io/crossfilter/)_, a sort of small client side OLAP database
    *   _[crossfilter server](https://github.com/ThomasRobertFr/crossfilter-server)_, a library we developed which allows us to do the same thing as we do with _crossfilter_, but delegate the OLAP computation to a SOLAP API for server side computation
    *   _[d3.js](http://d3js.org/)_, a library for SVG renderings of charts
    *   _[dc.js](https://github.com/ThomasRobertFr/dc.js)_, a modified version of the original _[dc.js](http://dc-js.github.io/dc.js/)_ for charts rendering of multidimensional crossfilter data
*   The **web app** in Python, _[analytics](https://github.com/ThomasRobertFr/analytics)_, delivering the data visualization interface, extending the existing web app _[GeoNode](http://geonode.org/)_
*   The **SOLAP API** in Java called _[Mandoline](https://github.com/ThomasRobertFr/mandoline)_, with its dependency _[olap4j](http://www.olap4j.org/)_, allowing us to query GeoMondrian easily in JSON
*   The **OLAP** **database** with a _[GeoMondrian](http://www.spatialytics.org/projects/geomondrian/)_ SOLAP server getting data from a _[PostgreSQL](http://www.postgresql.org/)_ database, doing the **data processing**

## analytics.js

The _analytics.js_ package represent the major part of the work that was done in this project. It is composed of various “namespaces”, each containing multiple “classes”. Of course, all this is JavaScript so “namespace” and “classes” are both objects. Here is the architecture of the package:

[![Architecture of analytics.js](/data/blog/loganalysis_architecture_analytics_js.png)](/data/blog/loganalysis_architecture_analytics_js.png)

You can see:

*   _analytics.query_ simplifies the interrogation of the SOLAP API through QueryAPI by offering specialized functions
*   _analytics.data_ offers data types representing OLAP elements and stores the data
*   _analytics.state_ stores and gives functions to modify the OLAP state of the current analysis (to simplify, which elements of which level of which dimensions are analyzed)
*   _analytics.display_ handles the interface (where is each chart and what is it displaying) and the interactions with the interface
*   _analytics.charts_ offers charts classes that can be instantiated when you want to create a chart

## Cross-filtering and _crossfilter-server.js_

One of the major “issue” we had to tackle was to provide an efficient cross-filtering on the interface. You can see this in the demonstration video above. Indeed, the filtering function is very useful for the user to be able to see how data are distributed across the elements of each dimension and explore the OLAP cube.

This filtering function will therefore be highly solicited and should be very efficient while still being able to handle big volumes of data.

There are actually two solutions to achieve this goal that can be represented on the following diagram:

[![Cross-filtering solutions](/data/blog/loganalysis_crossfilter.png)](/data/blog/loganalysis_crossfilter.png)

On this diagram, you can see the OLAP cube stored on the server on the left, and the charts we need to display on the right.

### First solution: _Crossfilter_

The first solution is to ask our OLAP server, GeoMondrian, to compute a smaller cube of data containing what we are currently studying. Here on the diagram, the cube in the middle contains data for French regions, years and mode of transportation.

This temporary cube is downloaded in the browser of the user and is then given to the library _crossfilter. Crossfilter_ will then be capable of computing projections of the cube on each dimension, and these projections will be used by dc.js to display the charts.

In this solution, the interface will be very responsive when filtering, because _crossfilter_ already has got all the data he need to compute the projections while taking filters into account. It will take less than a second to compute new projections taking new filters into account.

However, the defect of this solution is that the number of values in the temporary cube is the product of the number of elements studied in each dimension (e.g. for 6 regions, 2 years, 3 mode of transport we have 6 × 2 × 3 = 36 values), and this size grows exponentially. We will only support reasonable volumes because data will eventually become too big to be loaded in a reasonable time.

### Second solution: _Crossfilter Server_

The alternative solution would be to ask _GeoMondrian_ to directly compute the projection of the OLAP cube, after filtering, on each dimension studied, without computing the temporary cube that is too big.

In that case, the size of the data we load is the sum of the number of elements in the dimensions we study (e.g. for 6 regions, 2 years, 3 mode of transport we have 6 + 2 + 3 = 11 values), and this size grows linearly. We will be able to support big volumes because we load much fewer data (as long as GeoMondrian can process those volumes of course).

However, the drawback of this solution is that when the user changes the filters, we need to ask GeoMondrian to compute the projections on each dimension again, taking into account the new filters. This will significantly slow down the interface at each filtering because we need to query the server again while _crossfilter_ only needed to do a few computations locally.

Another issue with this solution is that our chart library, _dc.js_, is depending on _Crossfilter_ as a data model. We can’t just give it some data.

To solve this problem and make this alternative solution possible, we developed a small library that we called _Crossfilter Server_. This library has almost the same I/O interfaces as _Crossfilter_ (only the initialization should differ). And _Crossfilter Server_ will be able to reproduce _Crossfilter_’s behavior without having the full temporary cube, and by delegating all the computation to an API that will, in our case, call _GeoMondrian._

Therefore, we can either use _dc.js_ with _Crossfilter_ or _Crossfilter Server_.

### Recap & final solution

To recap, we have 2 possibilities:

[![Cross-filtering solutions](/data/blog/loganalysis_crossfilter.png)](/data/blog/loganalysis_crossfilter.png)

**Crossfilter**

*   $$\mathcal{O}(n^p)$$ $$\left(\prod_{i \in \mathcal{D}} n_i\right)$$  
    **$$\Rightarrow$$ Resonable volumes**
*   Quick client side filtering & aggregates (< 10 ms)  
    **$$\Rightarrow$$ Great responsivity**

**Crossfilter Server**

*   $$\mathcal{O}(n\times p)$$ $$\left(\sum_{i \in \mathcal{D}} n_i\right)$$  
    **$$\Rightarrow$$ Important volumes**
*   Server side filtering & aggregates, reload data ($$\approx$$ 1s)  
    **$$\Rightarrow$$ limited responsivity**

Our final solution was to use both of these solutions, using one or the other depending on the volume of data you are studying, and switching dynamically from one to the other when needed.

# Conclusion

This article is of course a quick summary of a very long project. If you want to know more about this project, you can read the documentation available in [the wiki of the GitHub repository](https://github.com/ThomasRobertFr/analytics/wiki) and take a look at the code of the components listed above. If you want, you can even contribute to the project by making pull-requests to it.

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">

<!-- The loading of KaTeX is deferred to speed up page rendering -->
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>

<!-- To automatically render math in text elements, include the auto-render extension: -->
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous"
    onload="renderMathInElement(document.body);"></script>

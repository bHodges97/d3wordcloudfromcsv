from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.cluster import KMeans,MiniBatchKMeans
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from savenpz import save_npz,load_npz

class Classifier():
    def __init__(self):
        self.tf = None

    def _tfidf_transform(self,tf):
        tfidfTransformer = TfidfTransformer()
        tfidf = tfidfTransformer.fit_transform(tf)
        return tfidf

    def load(self, path="./tfs.npz"):
        self.tf = load_npz(path)[0]
        self.tf = self.tf
        return self.tf

    def save(self, path="./tfs.npz"):
        if self.tf == None:
            print("No term frequencies loaded")
            return
        save_npz(path, self.tf, ["none"])

    def classify(self, papers=None, clusters=None, verbose=False, plot=False):
        if papers:
            tfidf = self._tfidf_transform(self.tf[papers,:])
        else:
            tfidf = self._tfidf_transform(self.tf)
        svd = TruncatedSVD(n_components=2)
        reduced = svd.fit_transform(tfidf)

        if not clusters:
            km = self.guess_k(reduced)
        else:
            km = MiniBatchKMeans(n_clusters=clusters, verbose=verbose)
            km.fit(reduced)

        y_kmeans = km.labels_
        if plot:
            centers = km.cluster_centers_
            ax = plt.figure().add_subplot(111)#, projection='3d')
            ax.scatter(reduced[:, 0], reduced[:, 1], c=y_kmeans,  cmap='viridis')
            ax.scatter(centers[:, 0], centers[:, 1], c='red', marker='x')
            for idx in range(len(y_kmeans)):
                ax.annotate(str(idx),reduced[idx])
            plt.show()
        return (km.labels_, km.n_clusters)

    def guess_k(self, x, kmin=2,kmax=6):
        kmax = min(x.shape[0]-1,kmax) #
        score = 0
        km = None
        for k in range(kmin, kmax+1):
            kmeans = MiniBatchKMeans(n_clusters=k).fit(x)
            if max(kmeans.labels_) == 0:
                return kmeans
            newscore = silhouette_score(x, kmeans.labels_, metric = 'euclidean')
            if newscore > score:
                score = newscore
                km = kmeans
        return km

    def wordcloud(self):#TODO
        classes = [[] for x in range(self.clusters)]
        for idx,c in enumerate(self.y_kmeans):
            classes[c].append(idx)

        for i in classes:
            print(i)


if __name__ == "__main__":
    a = Classifier()
    a.load()
    #X = a.count("downloads")
    a.classify(plot=True)
    #a.wordcloud()





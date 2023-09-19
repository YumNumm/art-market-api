### 画像をCloudflare Workersにアップロードする

import os
import sys
import json
import requests


class ImageTransfer:
    __base_url: str = "https://art-market-api.yumnumm.workers.dev"
    __x_api_key: str = "YOUR_API_KEY"

    def upload_image(userName: str, filePath: str) -> dict:
        """画像をアップロードする
        :param userName: ユーザー名
        :param filePath: ファイル名
        :returns: アップロードした画像の情報
        :rtype: dict
        """
        url = ImageTransfer.__base_url + "/upload/" + userName
        files = {"file": open(filePath, "rb")}
        fileName = os.path.basename(filePath)
        headers = {"X-Api-Key": ImageTransfer.__x_api_key}
        query = {
            "name": fileName,
        }
        response = requests.put(
            url,
            files=files,
            headers=headers,
            params=query,
        )
        return response.json()

    def download_image(userName: str, fileName: str) -> None:
        """画像をダウンロードする
        画像ファイルはカレントディレクトリに `fileName` という名前で保存される
        :param userName: ユーザー名
        :param fileName: ファイル名
        :rtype: None
        """
        url = "https://objects.tekken.work/" + userName + "/" + fileName
        response = requests.get(url, headers=headers)
        with open(fileName, "wb") as f:
            f.write(response.content)

    def list_user_contents(userName: str) -> dict:
        """ユーザーのコンテンツを一覧する
        :param userName: ユーザー名
        :returns: ユーザーのコンテンツの一覧
        :rtype: dict
        [{"userName": string, "fileName": string, "createdAt": string}]
        """
        url = ImageTransfer.__base_url + "/list/" + userName
        headers = {"X-Api-Key": ImageTransfer.__x_api_key}
        response = requests.get(url, headers=headers)
        result = response.json()
        return list(
            map(
                lambda x: {
                    "userName": x["key"].split("/")[0],
                    "fileName": x["key"].split("/")[1],
                    "createdAt": x["uploaded"],
                },
                result["result"]["objects"],
            )
        )

    def list_all_contents() -> dict:
        """
        全てのコンテンツを一覧する
        :returns: 全てのコンテンツの一覧
        :rtype: dict
        [{"userName": string, "fileName": string, "createdAt": string}]
        """
        url = ImageTransfer.__base_url + "/list"
        headers = {"X-Api-Key": ImageTransfer.__x_api_key}
        response = requests.get(url, headers=headers)
        result = response.json()
        return list(
            map(
                lambda x: {
                    "userName": x["key"].split("/")[0],
                    "fileName": x["key"].split("/")[1],
                    "createdAt": x["uploaded"],
                },
                result["result"]["objects"],
            )
        )
